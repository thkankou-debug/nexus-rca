// ============================================================================
// API ROUTE — POST /api/partenaire/retours (cahier §5.10)
// Dépôt d'un retour partenaire (accusé, avis, décision, demande de
// complément) sur un dossier EXPLICITEMENT partagé. La route revérifie le
// partage à chaque appel : une révocation bloque immédiatement le dépôt
// (R17). Le retour ne clôt jamais le dossier — le responsable interne est
// notifié et décide.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const TYPES = ["accuse", "avis", "decision", "complement_demande"] as const;
type ReturnType_ = (typeof TYPES)[number];

interface Body {
  demande_id: string;
  type: ReturnType_;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase
      .from("profiles")
      .select("role, is_test, nom, prenom")
      .eq("id", user.id)
      .single();
    const actorRow = actor as { role?: string; is_test?: boolean; nom?: string; prenom?: string | null } | null;
    if (actorRow?.role !== "partenaire") {
      return NextResponse.json({ success: false, error: "Réservé aux partenaires" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body?.demande_id || !TYPES.includes(body.type) || !body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "demande_id, type et contenu requis" },
        { status: 400 }
      );
    }

    const admin = getFinanceAdminClient();
    // R17 : le partage doit exister ENCORE au moment du dépôt.
    const { data: share } = await admin
      .from("dossier_partages")
      .select("id, demandes(id, reference, agent_id, nom_complet)")
      .eq("demande_id", body.demande_id)
      .eq("partenaire_id", user.id)
      .maybeSingle();
    if (!share) {
      return NextResponse.json(
        { success: false, error: "Ce dossier ne vous est pas (ou plus) partagé" },
        { status: 403 }
      );
    }
    const demande = (share as unknown as {
      demandes: { id: string; reference: string | null; agent_id: string | null; nom_complet: string };
    }).demandes;

    const { data: created, error } = await admin
      .from("partner_returns")
      .insert({
        demande_id: body.demande_id,
        partenaire_id: user.id,
        type: body.type,
        content: body.content.trim(),
        is_test: Boolean(actorRow.is_test),
      })
      .select("id, type, content, created_at")
      .single();
    if (error || !created) {
      console.error("[PARTENAIRE] insert error:", error?.message);
      return NextResponse.json({ success: false, error: error?.message || "Échec du dépôt" }, { status: 500 });
    }

    // Notifier le responsable du dossier (vérification interne avant toute
    // décision — le retour partenaire ne change jamais le dossier lui-même).
    if (demande.agent_id) {
      const name = [actorRow.prenom, actorRow.nom].filter(Boolean).join(" ") || "Partenaire";
      const typeLabel =
        body.type === "accuse"
          ? "accusé de réception"
          : body.type === "avis"
          ? "avis"
          : body.type === "decision"
          ? "DÉCISION"
          : "demande de complément";
      await createNotification(
        demande.agent_id,
        "info",
        `Retour partenaire (${typeLabel}) — ${demande.reference || demande.nom_complet}`,
        `${name} : ${body.content.trim().slice(0, 140)}`,
        `/dashboard/dossiers/${demande.id}`
      );
    }
    await logAudit({
      userId: user.id,
      userRole: "partenaire",
      action: "partenaire.retour",
      entityType: "partner_returns",
      entityId: (created as { id: string }).id,
      newValue: { demande_id: body.demande_id, type: body.type },
    });

    return NextResponse.json({ success: true, retour: created });
  } catch (err) {
    console.error("[PARTENAIRE] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
