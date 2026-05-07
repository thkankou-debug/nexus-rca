import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ReviewDetailView } from "@/components/dashboard/rh/ReviewDetailView";

export const metadata = {
  title: "Détail évaluation — Super Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminReviewDetailPage({
  params,
}: {
  params: { reviewId: string };
}) {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/evaluations"
        label="Retour aux évaluations"
      />
      <ReviewDetailView reviewId={params.reviewId} mode="admin" />
    </DashboardShell>
  );
}
