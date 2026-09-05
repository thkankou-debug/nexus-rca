import { notFound } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import PaymentPageClient from "@/components/payment/PaymentPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paiement sécurisé - Nexus RCA",
};

// Migration 033 : page publique, non authentifiée par définition. La lecture
// directe via la clé anon a été fermée (voir 033_hotfix_securite.sql), donc on
// passe par la clé service_role ici, en ne sélectionnant que les colonnes
// réellement affichées par PaymentPageClient — jamais notes_staff/notes_client.
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

export default async function PaymentPage({
  params,
}: {
  params: { reference: string };
}) {
  const admin = getAdminClient();

  const { data: paymentLink } = await admin
    .from("payment_links")
    .select(PUBLIC_COLUMNS)
    .eq("reference", params.reference)
    .single();

  if (!paymentLink) {
    notFound();
  }

  // Vérifier expiration
  const now = new Date();
  const expiresAt = new Date(paymentLink.expires_at);
  const isExpired = now > expiresAt || paymentLink.statut === "expire";

  return (
    <PaymentPageClient
      paymentLink={paymentLink}
      isExpired={isExpired}
    />
  );
}
