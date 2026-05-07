import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EmployeeDetailView } from "@/components/dashboard/rh/EmployeeDetailView";

export const metadata = {
  title: "Détail employé | Admin RH",
};

export const dynamic = "force-dynamic";

export default async function AdminEmployeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin/rh/employes"
        label="Retour à la liste"
      />

      <EmployeeDetailView
        employeeId={params.id}
        basePath="/dashboard/admin/rh"
        canSeeNotes={false}
        canDelete={false}
      />
    </DashboardShell>
  );
}
