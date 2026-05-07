import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PayslipDetailView } from "@/components/dashboard/rh/PayslipDetailView";

export const metadata = {
  title: "Détail fiche de paie | Admin RH",
};

export const dynamic = "force-dynamic";

export default async function AdminPayslipDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin/rh/paie"
        label="Retour à la liste"
      />

      <PayslipDetailView payslipId={params.id} canValidate={false} />
    </DashboardShell>
  );
}
