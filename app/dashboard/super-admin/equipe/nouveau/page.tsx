import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import NewTeamMemberPage from "@/components/dashboard/NewTeamMemberForm";

export const metadata = {
  title: "Créer un employé | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function CreateTeamMemberPageWrapper() {
  // SECURITE : seul super_admin peut acceder a cette page
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <NewTeamMemberPage />
    </DashboardShell>
  );
}
