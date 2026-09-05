import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// API : GET /api/payment-links/[reference]
// Migration 033 : seul point d'accès public aux données d'un lien de paiement.
// Utilise la clé service_role et ne sélectionne QUE les colonnes affichées sur
// la page /payer/[reference] — jamais notes_staff, notes_client, created_by,
// verified_by, payment_id, demande_id, appointment_id (voir docs/RLS_ETAT_REEL.md).
// ============================================================================

const PUBLIC_COLUMNS =
  "reference, service, description, montant, devise, statut, client_nom, client_email, verified_at, numero_transaction, expires_at";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const admin = getAdminClient();

    const { data: paymentLink, error } = await admin
      .from("payment_links")
      .select(PUBLIC_COLUMNS)
      .eq("reference", params.reference)
      .single();

    if (error || !paymentLink) {
      return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
    }

    return NextResponse.json({ paymentLink });
  } catch (err) {
    console.error("[PAYMENT-LINKS_GET] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
