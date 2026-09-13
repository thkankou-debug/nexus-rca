// ============================================================================
// API ROUTE — POST /api/demandes/:id/acceptation (cahier §7.3, lot G1)
// L'agent AFFECTÉ accepte ou refuse le dossier qui vient de lui être
// attribué. Refus : motif obligatoire + notification des admins pour
// réaffectation (l'affectation suivante remet l'état « en attente »).
// Le silence est escaladé par le cron quotidien d'escalades.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { createNotificationsForRoles } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface AcceptationBody {
  action: "accepter" | "refuser";
  motif?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    const { data: actor } = await supabase.from("profiles").select("role, nom, prenom").eq("id", user.id).single();
    const a = actor as { role?: string; nom?: string | null; prenom?: string | null } | null;
    const role = a?.role || "";

    const body = (await request.json().catch(() => null)) as AcceptationBody | null;
    if (!body || !["accepter", "refuser"].includes(body.action)) {
      return NextResponse.json({ success: false, error: "action 'accepter' ou 'refuser' requise" }, { status: 400 });
    }
    const motif = body.motif?.trim() || "";
    if (body.action === "refuser" && motif.length < 3) {
      return NextResponse.json(
        { success: false, error: "Motif obligatoire pour refuser une affectation" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data: demande } = await admin
      .from("demandes")
      .select("id, reference, nom_complet, service, agent_id, acceptation_status")
      .eq("id", params.id)
      .single();
    if (!demande) return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 });
    const d = demande as {
      id: string;
      reference: string | null;
      nom_complet: string;
      service: string;
      agent_id: string | null;
      acceptation_status: string | null;
    };

    // Seul l'agent AFFECTÉ répond — pas un autre, pas un admin à sa place.
    if (d.agent_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Seul l'agent affecté peut accepter ou refuser ce dossier" },
        { status: 403 }
      );
    }
    if (d.acceptation_status !== "en_attente") {
      return NextResponse.json(
        { success: false, error: "Cette affectation n'est pas en attente d'acceptation" },
        { status: 409 }
      );
    }

    const newStatus = body.action === "accepter" ? "acceptee" : "refusee";
    const { data: updated, error } = await admin
      .from("demandes")
      .update({
        acceptation_status: newStatus,
        acceptation_at: new Date().toISOString(),
        acceptation_motif: body.action === "refuser" ? motif.slice(0, 300) : null,
      })
      .eq("id", d.id)
      .eq("acceptation_status", "en_attente")
      .select("id, acceptation_status");
    if (error || !updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: error?.message || "L'affectation a changé — rechargez" },
        { status: 409 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: `demande.affectation_${newStatus}`,
      entityType: "demandes",
      entityId: d.id,
      newValue: { reference: d.reference, acceptation: newStatus, motif: motif || null },
    });

    if (body.action === "refuser") {
      const agentNom = [a?.prenom, a?.nom].filter(Boolean).join(" ") || "L'agent";
      await createNotificationsForRoles(
        ["admin", "super_admin"],
        "demande_urgent",
        `Affectation refusée — ${d.reference || d.nom_complet}`,
        `${agentNom} refuse le dossier (${d.service}) : ${motif}. Réaffectez-le.`,
        "/dashboard/admin/dossiers"
      );
    }

    return NextResponse.json({ success: true, acceptation: newStatus });
  } catch (err) {
    console.error("[ACCEPTATION] EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
