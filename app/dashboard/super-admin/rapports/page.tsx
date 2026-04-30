import { FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { MonthlyReportGenerator } from "@/components/dashboard/MonthlyReportGenerator";

export const metadata = {
  title: "Rapports financiers | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function RapportsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);

  const userName =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") ||
    profile.email ||
    "Super-admin";

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
            Rapports financiers
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Génère un rapport mensuel complet pour ta banque, ton comptable, tes investisseurs.
          </p>
        </div>
      </div>

      <MonthlyReportGenerator currentUserName={userName} />
    </DashboardShell>
  );
}
