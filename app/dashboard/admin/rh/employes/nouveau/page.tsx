import { UserPlus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { NewEmployeeClient } from "@/components/dashboard/rh/NewEmployeeClient";

export const metadata = {
  title: "Nouvel employé | Admin RH",
};

export const dynamic = "force-dynamic";

export default async function AdminNouvelEmployePage() {
  const profile = await requireProfile(["admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin/rh/employes"
        label="Retour à la liste"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
          <UserPlus className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Nouvel employé
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Créez la fiche d'un nouvel employé Nexus.
          </p>
        </div>
      </div>

      <NewEmployeeClient
        basePath="/dashboard/admin/rh"
        canSeeNotes={false}
      />
    </DashboardShell>
  );
}
