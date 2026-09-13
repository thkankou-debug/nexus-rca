import { requireProfile } from "@/lib/auth";
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
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/evaluations"
        label="Retour aux évaluations"
      />
      <ReviewDetailView reviewId={params.reviewId} mode="admin" />
    </>
  );
}
