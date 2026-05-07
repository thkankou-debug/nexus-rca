import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { OnboardingDetailView } from "@/components/dashboard/rh/OnboardingDetailView";

export const metadata = {
  title: "Détail onboarding | Super Admin RH",
};

export const dynamic = "force-dynamic";

export default async function OnboardingDetailPage({
  params,
}: {
  params: { employeeId: string };
}) {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/onboarding"
        label="Retour aux onboardings"
      />
      <OnboardingDetailView
        employeeId={params.employeeId}
        basePath="/dashboard/super-admin/rh"
        canReset
      />
    </DashboardShell>
  );
}
