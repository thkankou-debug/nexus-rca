import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { LeaveRequestsManager } from "@/components/dashboard/rh/LeaveRequestsManager";

export const metadata = {
  title: "Congés — Super Admin | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminLeavesPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à la vue RH"
      />
      <LeaveRequestsManager role="super_admin" />
    </DashboardShell>
  );
}
