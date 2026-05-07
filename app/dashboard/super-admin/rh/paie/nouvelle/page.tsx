import { Suspense } from "react";
import { Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { NewPayslipClient } from "@/components/dashboard/rh/NewPayslipClient";

export const metadata = {
  title: "Nouvelle fiche de paie | Super Admin RH",
};

export const dynamic = "force-dynamic";

export default async function NouvelleFichePaiePage() {
  const profile = await requireProfile(["super_admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/paie"
        label="Retour à la liste"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Nouvelle fiche de paie
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Créez un brouillon. Vous pourrez le soumettre pour validation
            ensuite.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <NewPayslipClient basePath="/dashboard/super-admin/rh" />
      </Suspense>
    </DashboardShell>
  );
}
