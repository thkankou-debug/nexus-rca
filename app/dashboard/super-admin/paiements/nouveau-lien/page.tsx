import { requireProfile } from "@/lib/auth";
import NewPaymentLinkForm from "@/components/payment/NewPaymentLinkForm";

export const metadata = {
  title: "Nouveau lien de paiement - Nexus",
};

export const dynamic = "force-dynamic";

export default async function NouveauLienPage() {
  await requireProfile(["agent", "admin", "super_admin"]);

  return (
    <>
      <NewPaymentLinkForm />
    </>
  );
}
