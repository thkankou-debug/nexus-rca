// ============================================================================
// API ROUTE — PATCH /api/accueil/agenda/:id
// Reprogrammation / réattribution d'un rendez-vous par la réceptionniste :
// nouvelle date/heure et/ou nouveau collaborateur, détection de conflit
// (409), audit, notification e-mail du collaborateur concerné (best
// effort). Les détails confidentiels (notes) ne transitent jamais ici.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

const HEURES_VALIDES = /^([01]\d|2[0-3]):[0-5]\d$/;
const AGENDA_FIELDS =
  "id, reference, client_nom, client_telephone, agent_id, service_type, rdv_date, rdv_heure, duree_minutes, statut";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface PatchBody {
  rdv_date?: string;
  rdv_heure?: string;
  agent_id?: string;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("rdv.create");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body || (!body.rdv_date && !body.rdv_heure && !body.agent_id)) {
      return NextResponse.json(
        { success: false, error: "rdv_date, rdv_heure ou agent_id requis" },
        { status: 400 }
      );
    }
    if (body.rdv_date && !/^\d{4}-\d{2}-\d{2}$/.test(body.rdv_date)) {
      return NextResponse.json({ success: false, error: "Date invalide" }, { status: 400 });
    }
    if (body.rdv_heure && !HEURES_VALIDES.test(body.rdv_heure)) {
      return NextResponse.json({ success: false, error: "Heure invalide (HH:MM)" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: rdv } = await admin.from("appointments").select(AGENDA_FIELDS).eq("id", params.id).single();
    if (!rdv) return NextResponse.json({ success: false, error: "Rendez-vous introuvable" }, { status: 404 });
    const r = rdv as {
      id: string;
      reference: string | null;
      client_nom: string;
      agent_id: string | null;
      service_type: string;
      rdv_date: string;
      rdv_heure: string;
      statut: string;
    };
    if (["annule_agent", "annule_client"].includes(r.statut)) {
      return NextResponse.json({ success: false, error: "Rendez-vous annulé — créez-en un nouveau" }, { status: 409 });
    }

    const newDate = body.rdv_date || r.rdv_date;
    const newHeure = body.rdv_heure || r.rdv_heure;
    const newAgent = body.agent_id || r.agent_id;
    if (!newAgent) {
      return NextResponse.json({ success: false, error: "Collaborateur requis" }, { status: 400 });
    }

    const { data: conflict } = await admin
      .from("appointments")
      .select("id")
      .eq("agent_id", newAgent)
      .eq("rdv_date", newDate)
      .eq("rdv_heure", newHeure)
      .neq("id", r.id)
      .not("statut", "in", "(annule_agent,annule_client)")
      .limit(1);
    if (conflict && conflict.length > 0) {
      return NextResponse.json(
        { success: false, error: "Conflit : ce collaborateur a déjà un rendez-vous à ce créneau" },
        { status: 409 }
      );
    }

    const { data: updated, error } = await admin
      .from("appointments")
      .update({ rdv_date: newDate, rdv_heure: newHeure, agent_id: newAgent, updated_at: new Date().toISOString() })
      .eq("id", r.id)
      .select(AGENDA_FIELDS)
      .single();
    if (error || !updated) {
      return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "agenda.rdv_reprogramme",
      entityType: "appointments",
      entityId: r.id,
      oldValue: { date: r.rdv_date, heure: r.rdv_heure, agent_id: r.agent_id },
      newValue: { date: newDate, heure: newHeure, agent_id: newAgent },
    });

    // Notifier le collaborateur concerné (nouveau + ancien si réattribué).
    const notifIds = new Set([newAgent, r.agent_id].filter(Boolean) as string[]);
    for (const agentId of notifIds) {
      const { data: agent } = await admin.from("profiles").select("email").eq("id", agentId).single();
      const email = (agent as { email?: string } | null)?.email;
      if (email) {
        await sendEmail({
          to: email,
          subject: `Rendez-vous ${r.reference || ""} reprogrammé — ${newDate} ${newHeure}`,
          html: `<p>Bonjour,</p><p>Le rendez-vous de <strong>${r.client_nom}</strong> (${r.service_type}) a été reprogrammé par la réception :</p>
                 <p>Nouveau créneau : <strong>${newDate}</strong> à <strong>${newHeure}</strong>${
                   newAgent !== r.agent_id ? " (réattribué)" : ""
                 }</p><p>— Nexus RCA, espace Accueil &amp; caisse</p>`,
          tag: "[AGENDA]",
        });
      }
    }

    return NextResponse.json({ success: true, rdv: updated });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[AGENDA] PATCH EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
