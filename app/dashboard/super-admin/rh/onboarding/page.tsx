import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { OnboardingDashboard } from "@/components/dashboard/rh/OnboardingDashboard";

export const metadata = {
  title: "Onboarding — Super Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminOnboardingPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à la vue RH"
      />
      <OnboardingDashboard
        basePath="/dashboard/super-admin/rh"
        canStart
      />
    </DashboardShell>
  );
}
