import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PeriodReviewsView } from "@/components/dashboard/rh/PeriodReviewsView";

export const metadata = {
  title: "Période d'évaluation — Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AdminPeriodPage({
  params,
}: {
  params: { periodId: string };
}) {
  const profile = await requireProfile(["admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin/rh/evaluations"
        label="Retour aux évaluations"
      />
      <PeriodReviewsView
        basePath="/dashboard/admin/rh"
        periodId={params.periodId}
      />
    </DashboardShell>
  );
}
