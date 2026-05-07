import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { OnboardingDashboard } from "@/components/dashboard/rh/OnboardingDashboard";

export const metadata = {
  title: "Onboarding — Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AdminOnboardingPage() {
  const profile = await requireProfile(["admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/admin" label="Retour" />
      <OnboardingDashboard basePath="/dashboard/admin/rh" canStart />
    </DashboardShell>
  );
}
