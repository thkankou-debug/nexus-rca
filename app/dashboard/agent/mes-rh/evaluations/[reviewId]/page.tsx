import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ReviewDetailView } from "@/components/dashboard/rh/ReviewDetailView";

export const metadata = {
  title: "Détail évaluation | Agent",
};

export const dynamic = "force-dynamic";

export default async function AgentReviewDetailPage({
  params,
}: {
  params: { reviewId: string };
}) {
  const profile = await requireProfile(["agent"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent/mes-rh/evaluations"
        label="Retour à mes évaluations"
      />
      <ReviewDetailView reviewId={params.reviewId} mode="self" />
    </DashboardShell>
  );
}
