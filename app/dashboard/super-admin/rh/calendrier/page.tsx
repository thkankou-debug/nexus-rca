import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { LeaveCalendar } from "@/components/dashboard/rh/LeaveCalendar";

export const metadata = {
  title: "Calendrier RH — Super Admin | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminCalendarPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à la vue RH"
      />
      <LeaveCalendar />
    </DashboardShell>
  );
}
