import { Briefcase } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AgentSpecialitesEditor } from "@/components/dossiers/AgentSpecialitesEditor";
import { getActiveAgents } from "@/lib/dossiers-server";

export const metadata = { title: "Spécialités agents · Super admin" };
export const dynamic = "force-dynamic";

export default async function SuperAdminAgentsPage() {
  const profile = await requireProfile(["super_admin"]);
  const agents = await getActiveAgents();

  return (
    <DashboardShell profile={profile}>
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-950 text-white shadow-lg">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Gouvernance équipe
          </p>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Spécialités des agents
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Configurez les catégories de dossiers que chaque agent maîtrise. Les
            nouveaux dossiers seront affectés en priorité aux spécialistes
            concernés (avec la charge la plus faible).
          </p>
        </div>
      </header>

      <AgentSpecialitesEditor initialAgents={agents} />
    </DashboardShell>
  );
}
