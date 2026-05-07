import { Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EmployeesListView } from "@/components/dashboard/rh/EmployeesListView";

export const metadata = {
  title: "RH — Employés | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function EmployesListPage() {
  const profile = await requireProfile(["super_admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin/rh" label="Retour RH" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Employés
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gérer les fiches employés Nexus RCA.
          </p>
        </div>
      </div>

      <EmployeesListView basePath="/dashboard/super-admin/rh" />
    </DashboardShell>
  );
}
