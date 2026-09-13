// ============================================================================
// API ROUTE — POST /api/demandes/:id/documents/:docId/controle
// DOC-02 (cahier §11) : le service compétent contrôle une pièce reçue —
// vérifiée ou rejetée (motif obligatoire). Portée : l'agent AFFECTÉ au
// dossier, le chef de service, l'admin, le super admin. La réception
// collecte, elle ne contrôle pas (§3.4). Motifs de rejet conservés.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const CONTROLLER_ROLES = ["agent", "chef_service", "admin", "super_admin"];

interface Body {
  decision: "verifie" | "rejete";
  motif?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";
    if (!CONTROLLER_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Le contrôle des pièces est réservé au service compétent" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body || !["verifie", "rejete"].includes(body.decision)) {
      return NextResponse.json({ success: false, error: "decision requise (verifie | rejete)" }, { status: 400 });
    }
    if (body.decision === "rejete" && !body.motif?.trim()) {
      return NextResponse.json({ success: false, error: "Motif obligatoire pour un rejet" }, { status: 400 });
    }

    const admin = getFinanceAdminClient();
    const { data: doc } = await admin
      .from("demande_documents")
      .select("id, demande_id, file_name, statut_controle, demandes(agent_id)")
      .eq("id", params.docId)
      .eq("demande_id", params.id)
      .single();
    if (!doc) {
      return NextResponse.json({ success: false, error: "Pièce introuvable sur ce dossier" }, { status: 404 });
    }
    const row = doc as unknown as {
      id: string;
      demande_id: string;
      file_name: string;
      statut_controle: string;
      demandes: { agent_id: string | null } | null;
    };
    // Portée agent : uniquement ses dossiers affectés (R04).
    if (role === "agent" && row.demandes?.agent_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Dossier non affecté — contrôle refusé" },
        { status: 403 }
      );
    }
    if (row.statut_controle === "remplace") {
      return NextResponse.json(
        { success: false, error: "Pièce remplacée par une version plus récente — contrôlez la nouvelle version" },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from("demande_documents")
      .update({
        statut_controle: body.decision,
        controle_motif: body.decision === "rejete" ? body.motif!.trim() : null,
        controlled_by: user.id,
        controlled_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: body.decision === "verifie" ? "document.verifie" : "document.rejete",
      entityType: "demande_documents",
      entityId: row.id,
      oldValue: { statut_controle: row.statut_controle },
      newValue: { statut_controle: body.decision, motif: body.motif?.trim() || null, file_name: row.file_name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DOCUMENTS] controle EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
