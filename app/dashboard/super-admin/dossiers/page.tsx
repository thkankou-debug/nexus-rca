import { FolderOpen, AlertTriangle, UserX, Inbox, Wallet } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DossiersIndexGrid } from "@/components/dossiers/DossiersIndexGrid";
import { RevenusParServiceCard } from "@/components/dossiers/RevenusParServiceCard";
import {
  getCategoryCounters,
  getGlobalDossiersStats,
  getRevenusParService,
} from "@/lib/dossiers-server";

export const metadata = { title: "Dossiers par catégorie · Super admin" };
export const dynamic = "force-dynamic";

export default async function SuperAdminDossiersIndexPage() {
  const profile = await requireProfile(["super_admin"]);

  const [counters, stats, revenusParService] = await Promise.all([
    getCategoryCounters(),
    getGlobalDossiersStats(),
    getRevenusParService(),
  ]);

  return (
    <DashboardShell profile={profile}>
      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-400">
              Vue globale
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Dossiers par catégorie
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Tableau de bord transverse de tous les dossiers — accès complet pour gouvernance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniCounter label="Demandes reçues" value={stats.demandesRecues} icon={Inbox} />
            <MiniCounter label="Actifs" value={stats.actifs} icon={FolderOpen} />
            <MiniCounter label="Urgents" value={stats.urgents} icon={AlertTriangle} />
            <MiniCounter label="Non assignés" value={stats.nonAssignes} icon={UserX} />
          </div>
        </div>
      </header>

      <RevenusParServiceCard rows={revenusParService} icon={Wallet} />

      <DossiersIndexGrid
        counters={counters}
        baseHref="/dashboard/super-admin/dossiers"
      />
    </DashboardShell>
  );
}

function MiniCounter({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="font-display text-xl font-bold tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}
