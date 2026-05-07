import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { OnboardingDetailView } from "@/components/dashboard/rh/OnboardingDetailView";

export const metadata = {
  title: "Détail onboarding | Admin RH",
};

export const dynamic = "force-dynamic";

export default async function AdminOnboardingDetailPage({
  params,
}: {
  params: { employeeId: string };
}) {
  const profile = await requireProfile(["admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin/rh/onboarding"
        label="Retour aux onboardings"
      />
      <OnboardingDetailView
        employeeId={params.employeeId}
        basePath="/dashboard/admin/rh"
        canReset={false}
      />
    </DashboardShell>
  );
}
