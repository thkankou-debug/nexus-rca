import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import NewPaymentLinkForm from "@/components/payment/NewPaymentLinkForm";

export const metadata = {
  title: "Nouveau lien de paiement - Nexus",
};

export const dynamic = "force-dynamic";

export default async function NouveauLienPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <NewPaymentLinkForm />
    </DashboardShell>
  );
}
