import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EmployeeDetailView } from "@/components/dashboard/rh/EmployeeDetailView";

export const metadata = {
  title: "Détail employé | Super Admin RH",
};

export const dynamic = "force-dynamic";

export default async function EmployeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["super_admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/employes"
        label="Retour à la liste"
      />

      <EmployeeDetailView
        employeeId={params.id}
        basePath="/dashboard/super-admin/rh"
        canSeeNotes
        canDelete
      />
    </DashboardShell>
  );
}
