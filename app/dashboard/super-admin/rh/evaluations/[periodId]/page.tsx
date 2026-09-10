import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { PeriodReviewsView } from "@/components/dashboard/rh/PeriodReviewsView";

export const metadata = {
  title: "Période d'évaluation — Super Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminPeriodPage({
  params,
}: {
  params: { periodId: string };
}) {
  const profile = await requireProfile(["super_admin"]);

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/evaluations"
        label="Retour aux évaluations"
      />
      <PeriodReviewsView
        basePath="/dashboard/super-admin/rh"
        periodId={params.periodId}
      />
    </>
  );
}
