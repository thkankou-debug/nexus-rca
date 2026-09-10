import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { PayslipDetailView } from "@/components/dashboard/rh/PayslipDetailView";

export const metadata = {
  title: "Détail fiche de paie | Super Admin RH",
};

export const dynamic = "force-dynamic";

export default async function PayslipDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["super_admin"]);
  return (
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/paie"
        label="Retour à la liste"
      />

      <PayslipDetailView payslipId={params.id} canValidate />
    </>
  );
}
