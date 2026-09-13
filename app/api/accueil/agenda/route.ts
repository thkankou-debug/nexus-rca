// ============================================================================
// API ROUTE — /api/accueil/agenda (demande Thierry 12/09/2026 : agenda
// partagé de l'équipe pour la réceptionniste).
// GET  : rendez-vous de la plage demandée (détails limités à
//        l'organisation — jamais les notes internes) + agents actifs.
// POST : création d'un RDV par la réceptionniste avec ATTRIBUTION à un
//        collaborateur, détection de CONFLIT (même agent, même date, même
//        heure → 409) et notification e-mail du collaborateur (best
//        effort : l'échec d'e-mail ne bloque jamais le RDV).
// Permissions : rdv.read / rdv.create (accueil_caisse les détient).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

const HEURES_VALIDES = /^([01]\d|2[0-3]):[0-5]\d$/;

// Types autorisés par la contrainte appointments_service_type_check (base).
const SERVICE_TYPES = [
  "visa",
  "bourse",
  "tcf",
  "billet",
  "hotel",
  "transfert",
  "consultation_generale",
  "autre",
] as const;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getActor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_test, prenom, nom")
    .eq("id", user.id)
    .single();
  return profile as { id: string; role: string; is_test?: boolean; prenom: string | null; nom: string | null } | null;
}

// Champs exposés à l'accueil : le nécessaire pour ORGANISER — jamais
// notes_client / notes_agent (détails confidentiels du dossier).
const AGENDA_FIELDS =
  "id, reference, client_nom, client_telephone, agent_id, service_type, rdv_date, rdv_heure, duree_minutes, statut";

export async function GET(request: NextRequest) {
  try {
    await assertPermission("rdv.read");
    const actor = await getActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const debut = request.nextUrl.searchParams.get("debut");
    const fin = request.nextUrl.searchParams.get("fin");
    if (!debut || !fin) {
      return NextResponse.json({ success: false, error: "debut et fin (YYYY-MM-DD) requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const [rdvRes, agentsRes] = await Promise.all([
      admin
        .from("appointments")
        .select(AGENDA_FIELDS)
        .gte("rdv_date", debut)
        .lte("rdv_date", fin)
        .not("statut", "in", "(annule_agent,annule_client)")
        .eq("is_test", Boolean(actor.is_test))
        .order("rdv_date", { ascending: true })
        .order("rdv_heure", { ascending: true }),
      admin
        .from("profiles")
        .select("id, nom, prenom")
        .eq("role", "agent")
        .eq("actif", true)
        .eq("is_test", Boolean(actor.is_test))
        .order("nom", { ascending: true }),
    ]);

    return NextResponse.json({
      success: true,
      rdvs: rdvRes.data || [],
      agents: agentsRes.data || [],
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[AGENDA] GET EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}

interface CreateRdvBody {
  client_nom: string;
  client_telephone?: string;
  client_email?: string;
  service_type: string;
  rdv_date: string;
  rdv_heure: string;
  duree_minutes?: number;
  agent_id: string;
}

async function detectConflict(
  admin: ReturnType<typeof getAdminClient>,
  agentId: string,
  date: string,
  heure: string,
  excludeId?: string
): Promise<boolean> {
  let q = admin
    .from("appointments")
    .select("id")
    .eq("agent_id", agentId)
    .eq("rdv_date", date)
    .eq("rdv_heure", heure)
    .not("statut", "in", "(annule_agent,annule_client)");
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q.limit(1);
  return Boolean(data && data.length > 0);
}

async function notifyAgent(
  admin: ReturnType<typeof getAdminClient>,
  agentId: string,
  subject: string,
  bodyHtml: string
) {
  // Best effort : jamais bloquant pour le RDV.
  const { data: agent } = await admin.from("profiles").select("email, prenom").eq("id", agentId).single();
  const email = (agent as { email?: string } | null)?.email;
  if (!email) return;
  await sendEmail({ to: email, subject, html: bodyHtml, tag: "[AGENDA]" });
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("rdv.create");
    const actor = await getActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as CreateRdvBody | null;
    const nom = body?.client_nom?.trim();
    if (!body || !nom || nom.length < 2) {
      return NextResponse.json({ success: false, error: "Nom du client requis" }, { status: 400 });
    }
    if (!SERVICE_TYPES.includes((body.service_type || "") as (typeof SERVICE_TYPES)[number])) {
      return NextResponse.json({ success: false, error: "Type de service invalide" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.rdv_date || "")) {
      return NextResponse.json({ success: false, error: "Date invalide (YYYY-MM-DD)" }, { status: 400 });
    }
    if (!HEURES_VALIDES.test(body.rdv_heure || "")) {
      return NextResponse.json({ success: false, error: "Heure invalide (HH:MM)" }, { status: 400 });
    }
    if (!body.agent_id) {
      return NextResponse.json({ success: false, error: "Collaborateur à attribuer requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    if (await detectConflict(admin, body.agent_id, body.rdv_date, body.rdv_heure)) {
      return NextResponse.json(
        { success: false, error: "Conflit : ce collaborateur a déjà un rendez-vous à ce créneau" },
        { status: 409 }
      );
    }

    const { data: created, error } = await admin
      .from("appointments")
      .insert({
        client_nom: nom,
        client_email: body.client_email?.trim() || "",
        client_telephone: body.client_telephone?.trim() || null,
        service_type: body.service_type.trim(),
        rdv_date: body.rdv_date,
        rdv_heure: body.rdv_heure,
        duree_minutes: Number(body.duree_minutes) > 0 ? Number(body.duree_minutes) : 30,
        agent_id: body.agent_id,
        statut: "confirme",
        confirmed_at: new Date().toISOString(),
        confirmed_by: actor.id,
        is_test: Boolean(actor.is_test),
      })
      .select(AGENDA_FIELDS)
      .single();
    if (error || !created) {
      console.error("[AGENDA] insert error:", error?.message);
      return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "agenda.rdv_cree",
      entityType: "appointments",
      entityId: (created as { id: string }).id,
      newValue: { client: nom, agent_id: body.agent_id, date: body.rdv_date, heure: body.rdv_heure },
    });

    await notifyAgent(
      admin,
      body.agent_id,
      `Nouveau rendez-vous le ${body.rdv_date} à ${body.rdv_heure}`,
      `<p>Bonjour,</p><p>La réception vous a attribué un rendez-vous :</p>
       <p><strong>${nom}</strong> · ${body.service_type.trim()}<br/>
       Le <strong>${body.rdv_date}</strong> à <strong>${body.rdv_heure}</strong></p>
       <p>— Nexus RCA, espace Accueil &amp; caisse</p>`
    );

    return NextResponse.json({ success: true, rdv: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[AGENDA] POST EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
