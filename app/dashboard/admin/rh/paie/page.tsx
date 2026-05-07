import { Wallet } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PayslipsListView } from "@/components/dashboard/rh/PayslipsListView";

export const metadata = {
  title: "RH — Fiches de paie | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPaieListPage() {
  const profile = await requireProfile(["admin"]);
  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Fiches de paie
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Création et suivi des bulletins de paie. Validation finale
            effectuée par le Super-Admin.
          </p>
        </div>
      </div>

      <PayslipsListView basePath="/dashboard/admin/rh" />
    </DashboardShell>
  );
}
