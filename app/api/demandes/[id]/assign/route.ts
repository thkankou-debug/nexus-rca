// ============================================================================
// API ROUTE — POST /api/demandes/:id/assign
// Réservé admin / super_admin. Assigne un agent à un dossier, écrit un
// historique, et notifie agent + client par email Resend + notification in-app.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import {
  agentDossierAssigneEmail,
  clientConseillerAssigneEmail,
} from "@/lib/email/templates";
import { CATEGORIE_META, isCategorieDossier } from "@/lib/demande-categories";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: actor } = await supabase
      .from("profiles")
      .select("id, role, nom, prenom")
      .eq("id", user.id)
      .single();

    const actorRole = (actor as { role?: string } | null)?.role || "";
    if (actorRole !== "admin" && actorRole !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Réservé admin/super_admin" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { agent_id?: string };
    const newAgentId = (body.agent_id || "").trim();
    if (!newAgentId) {
      return NextResponse.json(
        { success: false, error: "agent_id requis" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // Vérifier que l'agent cible est valide (rôle agent + actif)
    const { data: targetAgent } = await admin
      .from("profiles")
      .select("id, nom, prenom, email, role, actif")
      .eq("id", newAgentId)
      .single();

    const target = targetAgent as
      | { id: string; nom: string; prenom: string | null; email: string; role: string; actif: boolean }
      | null;

    if (!target || target.role !== "agent" || !target.actif) {
      return NextResponse.json(
        { success: false, error: "Agent introuvable ou inactif" },
        { status: 400 }
      );
    }

    // Charger la demande
    const { data: demandeRow } = await admin
      .from("demandes")
      .select(
        "id, reference, service, categorie_dossier, current_step, current_step_label, agent_id, client_id, email, nom_complet"
      )
      .eq("id", params.id)
      .single();

    const demande = demandeRow as
      | {
          id: string;
          reference: string | null;
          service: string;
          categorie_dossier: string | null;
          current_step: number | null;
          current_step_label: string | null;
          agent_id: string | null;
          client_id: string | null;
          email: string;
          nom_complet: string;
        }
      | null;

    if (!demande) {
      return NextResponse.json(
        { success: false, error: "Dossier introuvable" },
        { status: 404 }
      );
    }

    // Mise à jour
    const { error: updErr } = await admin
      .from("demandes")
      .update({ agent_id: newAgentId })
      .eq("id", params.id);

    if (updErr) {
      console.error("[ASSIGN] update error:", updErr.message);
      return NextResponse.json(
        { success: false, error: updErr.message },
        { status: 500 }
      );
    }

    // Historique
    const actorName =
      [
        (actor as { prenom?: string }).prenom,
        (actor as { nom?: string }).nom,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Staff Nexus";

    await admin.from("demande_status_history").insert({
      demande_id: params.id,
      step: demande.current_step ?? 1,
      step_label: `Assigné à ${target.prenom ?? ""} ${target.nom}`.trim(),
      changed_by: user.id,
      notes: `Assigné par ${actorName}`,
    });

    // Notif in-app à l'agent
    const categorieSlug = isCategorieDossier(demande.categorie_dossier ?? "")
      ? (demande.categorie_dossier as string)
      : "autres";

    await createNotification(
      newAgentId,
      "demande_assigned",
      "Nouveau dossier assigné",
      `${demande.reference ?? "Dossier"} — ${demande.service}`,
      `/dashboard/agent/dossiers/${categorieSlug}/${params.id}`
    );

    // Email à l'agent
    const targetMeta = CATEGORIE_META[isCategorieDossier(categorieSlug) ? categorieSlug as keyof typeof CATEGORIE_META : "autres"];
    const agentMail = agentDossierAssigneEmail({
      agentPrenom: target.prenom,
      reference: demande.reference ?? "—",
      service: demande.service,
      categorieSlug,
      categorieLabel: targetMeta.label,
      clientNom: demande.nom_complet,
      demandeId: demande.id,
      assigneParNom: actorName,
    });

    await sendEmail({
      to: target.email,
      subject: agentMail.subject,
      html: agentMail.html,
      tag: "[ASSIGN_AGENT]",
    });

    // Email au client (si email connu)
    if (demande.email) {
      const clientMail = clientConseillerAssigneEmail({
        clientPrenom: null,
        clientNomComplet: demande.nom_complet,
        reference: demande.reference ?? "—",
        service: demande.service,
        conseillerNom: `${target.prenom ?? ""} ${target.nom}`.trim() || "Votre conseiller",
        conseillerEmail: target.email,
        conseillerPoste: null,
        demandeId: demande.id,
      });
      await sendEmail({
        to: demande.email,
        subject: clientMail.subject,
        html: clientMail.html,
        tag: "[ASSIGN_CLIENT]",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ASSIGN] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
