import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentPageClient from "@/components/payment/PaymentPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paiement sécurisé - Nexus RCA",
};

export default async function PaymentPage({
  params,
}: {
  params: { reference: string };
}) {
  const supabase = createClient();

  const { data: paymentLink } = await supabase
    .from("payment_links")
    .select("*")
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
