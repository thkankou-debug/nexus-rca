// ============================================================================
// API ROUTE — /api/accueil/dossiers
// GET  : dossiers d'un client (parcours devis/facture).
// POST : ouverture + orientation. Champs V4 : objet, description, urgence,
//        échéance, détails service (JSON), type de demande, brouillon.
// La réception n'applique jamais dossier.status.change.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";
import { urgenceFromPriorite, type PrioriteAccueil } from "@/lib/accueil-forms";

export const dynamic = "force-dynamic";

const DOSSIER_FIELDS =
  "id, reference, service, statut, objet, description, urgence, deadline, date_souhaitee, type_procedure, details_service, agent_id, created_at, nom_complet, client_record_id";

async function getActor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: actor } = await supabase
    .from("profiles")
    .select("id, role, is_test")
    .eq("id", user.id)
    .single();
  if (!actor) return null;
  const a = actor as { id: string; role: string; is_test?: boolean };
  return { id: user.id, role: a.role, isTest: Boolean(a.is_test) };
}

export async function GET(request: NextRequest) {
  try {
    await assertPermission("dossier.read.limited");
    const actor = await getActor();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const clientId = (request.nextUrl.searchParams.get("client_id") || "").trim();
    if (!clientId) {
      return NextResponse.json({ success: false, error: "client_id requis" }, { status: 400 });
    }
    const admin = getAccueilAdminClient();
    let query = admin
      .from("demandes")
      .select(DOSSIER_FIELDS)
      .eq("client_record_id", clientId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!actor.isTest) query = query.eq("is_test", false);
    const { data, error } = await query;
    if (error) {
      console.error("[ACCUEIL_DOSSIERS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, dossiers: data || [] });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ACCUEIL_DOSSIERS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

interface OpenDossierBody {
  client_record_id: string;
  service: string;
  service_id?: string | null;
  motif?: string;
  objet?: string;
  description?: string;
  type_procedure?: string;
  priorite?: PrioriteAccueil;
  echeance?: string | null;
  agent_id?: string | null;
  details_service?: Record<string, unknown>;
  draft?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("dossier.create");
    const actor = await getActor();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as OpenDossierBody | null;
    if (!body?.client_record_id || !body.service?.trim()) {
      return NextResponse.json(
        { success: false, error: "Client et service destinataire sont requis" },
        { status: 400 }
      );
    }

    const draft = Boolean(body.draft);
    const objet = (body.objet || body.motif || "").trim();
    const description = (body.description || body.motif || objet).trim();
    if (!draft && !objet) {
      return NextResponse.json(
        { success: false, error: "L'objet (ou le motif) est indispensable à l'ouverture" },
        { status: 400 }
      );
    }
    if (body.agent_id) {
      await assertPermission("dossier.orient");
    }

    const admin = getAccueilAdminClient();
    const { data: client } = await admin
      .from("clients")
      .select("id, nom, prenom, raison_sociale, email, telephone, pays, ville, type, is_test")
      .eq("id", body.client_record_id)
      .single();
    if (!client) {
      return NextResponse.json({ success: false, error: "Client introuvable" }, { status: 404 });
    }
    const c = client as {
      id: string;
      nom: string;
      prenom: string | null;
      raison_sociale: string | null;
      email: string | null;
      telephone: string | null;
      pays: string | null;
      ville: string | null;
      type: string;
      is_test: boolean;
    };

    if (body.agent_id) {
      const { data: agent } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", body.agent_id)
        .single();
      if (!agent || (agent as { role: string }).role !== "agent") {
        return NextResponse.json({ success: false, error: "Agent proposé invalide" }, { status: 400 });
      }
    }

    const nomComplet =
      c.type === "particulier" ? [c.prenom, c.nom].filter(Boolean).join(" ") : c.raison_sociale || c.nom;

    const priorite: PrioriteAccueil =
      body.priorite === "urgente" || body.priorite === "critique" ? body.priorite : "normale";
    const details: Record<string, unknown> = {
      ...(body.details_service && typeof body.details_service === "object" ? body.details_service : {}),
      source_accueil: "v4",
      draft,
    };

    const insertPayload: Record<string, unknown> = {
      client_record_id: c.id,
      agent_id: body.agent_id || null,
      nom_complet: nomComplet || c.nom,
      email: c.email || "",
      telephone: c.telephone || "",
      pays: c.pays || "République Centrafricaine",
      ville: c.ville,
      service: body.service.trim(),
      objet: objet || (draft ? "Brouillon" : objet),
      description: description || (draft ? "Brouillon — à compléter" : objet),
      urgence: urgenceFromPriorite(priorite),
      deadline: body.echeance || null,
      date_souhaitee: body.echeance || null,
      type_procedure: body.type_procedure?.trim() || null,
      details_service: details,
      source: "accueil",
      is_test: c.is_test,
    };
    if (body.service_id) insertPayload.service_id = body.service_id;

    const { data: created, error: insertError } = await admin
      .from("demandes")
      .insert(insertPayload)
      .select(DOSSIER_FIELDS)
      .single();

    if (insertError || !created) {
      console.error("[ACCUEIL_DOSSIERS] insert error:", insertError?.message);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Échec de l'ouverture du dossier" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "accueil.dossier.ouvert",
      entityType: "demandes",
      entityId: (created as { id: string }).id,
      newValue: {
        client_record_id: c.id,
        service: body.service.trim(),
        agent_id: body.agent_id || null,
        draft,
      },
    });

    return NextResponse.json({ success: true, dossier: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ACCUEIL_DOSSIERS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
