import { FolderOpen, AlertTriangle, UserX, Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DossiersIndexGrid } from "@/components/dossiers/DossiersIndexGrid";
import {
  getCategoryCounters,
  getGlobalDossiersStats,
} from "@/lib/dossiers-server";

export const metadata = { title: "Dossiers par catégorie · Agent" };
export const dynamic = "force-dynamic";

export default async function AgentDossiersIndexPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const profileAny = profile as unknown as Record<string, unknown>;
  const specialites = (profileAny.specialites as string[] | null) || [];

  const [counters, stats] = await Promise.all([
    getCategoryCounters(),
    getGlobalDossiersStats(),
  ]);

  return (
    <>
      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-400">
              Espace conseiller
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Dossiers par catégorie
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {specialites.length > 0
                ? `Vos spécialités : ${specialites.length} catégorie(s) — vous êtes notifié(e) automatiquement.`
                : "Vos spécialités ne sont pas encore configurées. Contactez un administrateur."}
            </p>
          </div>
          <GlobalCounters
            actifs={stats.actifs}
            urgents={stats.urgents}
            nonAssignes={stats.nonAssignes}
            demandesRecues={stats.demandesRecues}
          />
        </div>
      </header>

      <DossiersIndexGrid
        counters={counters}
        baseHref="/dashboard/agent/dossiers"
        agentSpecialites={specialites}
      />
    </>
  );
}

function GlobalCounters({
  actifs,
  urgents,
  nonAssignes,
  demandesRecues,
}: {
  actifs: number;
  urgents: number;
  nonAssignes: number;
  demandesRecues: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Counter label="Demandes reçues" value={demandesRecues} icon={Inbox} />
      <Counter label="Actifs" value={actifs} icon={FolderOpen} />
      <Counter label="Urgents" value={urgents} icon={AlertTriangle} />
      <Counter label="Non assignés" value={nonAssignes} icon={UserX} />
    </div>
  );
}

function Counter({
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
