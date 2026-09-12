// ============================================================================
// API ROUTE — GET /api/accueil/clients/:id
// Espace Accueil & Caisse. Fiche minimale pour le Comptoir POS (étape 3
// "Dossier") : coordonnées + dossiers actifs du client, champs limités à ce
// que la réception doit voir (dossier.read.limited — jamais notes_internes).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("client.read");

    const admin = getAccueilAdminClient();
    const { data: client, error } = await admin
      .from("clients")
      .select("id, reference, type, nom, prenom, raison_sociale, email, telephone, ville")
      .eq("id", params.id)
      .single();

    if (error || !client) {
      return NextResponse.json({ success: false, error: "Client introuvable" }, { status: 404 });
    }

    const { data: dossiers } = await admin
      .from("demandes")
      .select("id, reference, service, statut, created_at")
      .eq("client_record_id", params.id)
      .not("statut", "in", "(termine,refuse,annule,archive)")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ success: true, client, dossiers: dossiers || [] });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ACCUEIL_CLIENTS] GET/:id EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
