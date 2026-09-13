import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { EvaluationsDashboard } from "@/components/dashboard/rh/EvaluationsDashboard";

export const metadata = {
  title: "Évaluations — Super Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminEvaluationsPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à la vue RH"
      />
      <EvaluationsDashboard
        basePath="/dashboard/super-admin/rh"
        canCreate
        canLaunch
      />
    </>
  );
}
