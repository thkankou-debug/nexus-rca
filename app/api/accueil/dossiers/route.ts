// ============================================================================
// API ROUTE — POST /api/accueil/dossiers
// Espace Accueil & Caisse (§3.2 "Orientation du dossier", §3.4 "Ouvrir et
// orienter un dossier"). La réception OUVRE un dossier pour un client
// existant et l'ORIENTE vers un service destinataire, avec un agent proposé
// en option — elle ne le traite pas, ne change jamais son statut ensuite
// (dossier.status.change explicitement refusée au rôle).
// Permissions : dossier.create (ouverture) + dossier.orient (si un agent est
// proposé). Choix explicite, jamais implicite : le client et le motif sont
// obligatoires.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface OpenDossierBody {
  client_record_id: string;
  service: string;
  motif: string;
  agent_id?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("dossier.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase
      .from("profiles")
      .select("role, is_test")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as OpenDossierBody | null;
    if (!body?.client_record_id || !body.service?.trim() || !body.motif?.trim()) {
      return NextResponse.json(
        { success: false, error: "Client, service destinataire et motif sont requis" },
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

    const { data: created, error: insertError } = await admin
      .from("demandes")
      .insert({
        client_record_id: c.id,
        agent_id: body.agent_id || null,
        nom_complet: nomComplet || c.nom,
        email: c.email || "",
        telephone: c.telephone || "",
        pays: c.pays || "République Centrafricaine",
        ville: c.ville,
        service: body.service.trim(),
        description: body.motif.trim(),
        source: "accueil",
        is_test: c.is_test,
      })
      .select("id, reference, service, statut, created_at")
      .single();

    if (insertError || !created) {
      console.error("[ACCUEIL_DOSSIERS] insert error:", insertError?.message);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Échec de l'ouverture du dossier" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "accueil.dossier.ouvert",
      entityType: "demandes",
      entityId: (created as { id: string }).id,
      newValue: {
        client_record_id: c.id,
        service: body.service.trim(),
        agent_id: body.agent_id || null,
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
