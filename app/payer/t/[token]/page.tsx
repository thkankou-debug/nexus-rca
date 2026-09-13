import { notFound } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import PaymentPageClient from "@/components/payment/PaymentPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paiement sécurisé - Nexus RCA",
};

// Migration 034 : page publique par jeton (public_token), non déductible —
// remplace à terme /payer/[reference], dont la référence séquentielle était
// énumérable. Clé service_role, colonnes strictement limitées à ce
// qu'affiche PaymentPageClient. client_email, numero_transaction et
// verified_at ne sortent jamais de cette route.
//
// Chemin /payer/t/[token] (et non /payer/[token]) : Next.js App Router exige
// que tous les segments dynamiques d'un même niveau partagent le même nom.
// /payer/[reference] existe déjà et doit rester actif.
const PUBLIC_COLUMNS =
  "reference, service, description, montant, devise, statut, client_nom, expires_at";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function PaymentTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const admin = getAdminClient();

  const { data: paymentLink, error } = await admin
    .from("payment_links")
    .select(PUBLIC_COLUMNS)
    .eq("public_token", params.token)
    .single();

  if (error) {
    console.error("[PAYER-TOKEN]", JSON.stringify(error));
  }

  if (!paymentLink) {
    notFound();
  }

  const now = new Date();
  const expiresAt = new Date(paymentLink.expires_at);
  const isExpired = now > expiresAt || paymentLink.statut === "expire";

  return (
    <PaymentPageClient
      paymentLink={paymentLink}
      isExpired={isExpired}
      token={params.token}
    />
  );
}
