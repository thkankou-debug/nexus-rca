import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { LeaveRequestsManager } from "@/components/dashboard/rh/LeaveRequestsManager";

export const metadata = {
  title: "Congés — Admin | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AdminLeavesPage() {
  const profile = await requireProfile(["admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin"
        label="Retour au tableau de bord"
      />
      <LeaveRequestsManager role="admin" />
    </DashboardShell>
  );
}
