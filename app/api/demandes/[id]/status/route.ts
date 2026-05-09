// ============================================================================
// API ROUTE — POST /api/demandes/:id/status
// Réservé staff (agent / admin / super_admin). Met à jour current_step et/ou
// statut + notes, écrit un historique, et notifie le client par email.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { clientStatutChangeEmail } from "@/lib/email/templates";
import {
  getCategorieSteps,
  getCurrentStepLabel,
} from "@/lib/demande-status";
import { isCategorieDossier } from "@/lib/demande-categories";
import type { CategorieDossierSlug, DemandeStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUTS: DemandeStatus[] = [
  "nouveau",
  "en_cours",
  "en_attente",
  "incomplet",
  "en_traitement",
  "complete",
  "annule",
];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface StatusBody {
  current_step?: number;
  statut?: DemandeStatus;
  notes?: string;
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
    const isStaff =
      actorRole === "agent" || actorRole === "admin" || actorRole === "super_admin";
    if (!isStaff) {
      return NextResponse.json(
        { success: false, error: "Réservé staff" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as StatusBody;

    if (
      body.current_step !== undefined &&
      (!Number.isInteger(body.current_step) ||
        body.current_step < 1 ||
        body.current_step > 6)
    ) {
      return NextResponse.json(
        { success: false, error: "current_step doit être entre 1 et 6" },
        { status: 400 }
      );
    }
    if (body.statut && !VALID_STATUTS.includes(body.statut)) {
      return NextResponse.json(
        { success: false, error: "statut invalide" },
        { status: 400 }
      );
    }
    if (body.notes && body.notes.length > 1000) {
      return NextResponse.json(
        { success: false, error: "notes trop longues (max 1000)" },
        { status: 400 }
      );
    }
    if (body.current_step === undefined && !body.statut && !body.notes) {
      return NextResponse.json(
        { success: false, error: "Aucune modification fournie" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: demandeRow } = await admin
      .from("demandes")
      .select(
        "id, reference, service, categorie_dossier, current_step, current_step_label, agent_id, email, nom_complet, statut"
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
          email: string;
          nom_complet: string;
          statut: DemandeStatus;
        }
      | null;

    if (!demande) {
      return NextResponse.json(
        { success: false, error: "Dossier introuvable" },
        { status: 404 }
      );
    }

    const categorieSlug = isCategorieDossier(demande.categorie_dossier ?? "")
      ? (demande.categorie_dossier as CategorieDossierSlug)
      : "autres";

    const update: Record<string, unknown> = {};
    let newStepLabel: string | null = null;

    if (body.current_step !== undefined && body.current_step !== demande.current_step) {
      update.current_step = body.current_step;
      newStepLabel = getCurrentStepLabel(
        demande.service,
        body.current_step,
        categorieSlug
      );
      update.current_step_label = newStepLabel;
    }
    if (body.statut && body.statut !== demande.statut) {
      update.statut = body.statut;
    }

    if (Object.keys(update).length > 0) {
      const { error: updErr } = await admin
        .from("demandes")
        .update(update)
        .eq("id", params.id);
      if (updErr) {
        console.error("[STATUS] update error:", updErr.message);
        return NextResponse.json(
          { success: false, error: updErr.message },
          { status: 500 }
        );
      }
    }

    // Historique (toujours écrit dès qu'il y a un changement notable)
    const stepForHistory = body.current_step ?? demande.current_step ?? 1;
    const labelForHistory =
      newStepLabel ??
      getCurrentStepLabel(demande.service, stepForHistory, categorieSlug);

    await admin.from("demande_status_history").insert({
      demande_id: params.id,
      step: stepForHistory,
      step_label: labelForHistory,
      changed_by: user.id,
      notes: body.notes || null,
    });

    // Email au client si l'étape a réellement bougé et qu'on a un email
    if (
      body.current_step !== undefined &&
      body.current_step !== demande.current_step &&
      demande.email
    ) {
      const actorName =
        [
          (actor as { prenom?: string }).prenom,
          (actor as { nom?: string }).nom,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || null;

      const mail = clientStatutChangeEmail({
        clientPrenom: null,
        clientNomComplet: demande.nom_complet,
        reference: demande.reference ?? "—",
        service: demande.service,
        newStep: body.current_step,
        newStepLabel: newStepLabel ?? labelForHistory,
        conseillerNom: actorName,
        notesConseiller: body.notes ?? null,
        demandeId: demande.id,
      });

      await sendEmail({
        to: demande.email,
        subject: mail.subject,
        html: mail.html,
        tag: "[STATUS_CHANGE]",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[STATUS] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
