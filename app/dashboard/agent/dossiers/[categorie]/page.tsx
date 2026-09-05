import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DossiersListClient } from "@/components/dossiers/DossiersListClient";
import {
  CATEGORIE_META,
  isCategorieDossier,
} from "@/lib/demande-categories";
import {
  getActiveAgents,
  getDossiersByCategorie,
} from "@/lib/dossiers-server";

export const dynamic = "force-dynamic";

export default async function AgentDossiersListPage({
  params,
}: {
  params: { categorie: string };
}) {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  if (!isCategorieDossier(params.categorie)) notFound();

  const meta = CATEGORIE_META[params.categorie];
  const Icon = meta.icon;

  const [demandes, agents] = await Promise.all([
    getDossiersByCategorie(params.categorie),
    getActiveAgents(),
  ]);

  return (
    <DashboardShell profile={profile}>
      <Link
        href="/dashboard/agent/dossiers"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ChevronLeft className="h-4 w-4" />
        Toutes les catégories
      </Link>

      <header className="mb-6 flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.iconBg}`}
        >
          <Icon className={`h-7 w-7 ${meta.iconColor}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Catégorie
          </p>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            {meta.label}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {demandes.length} dossier{demandes.length > 1 ? "s" : ""} dans cette catégorie
          </p>
        </div>
      </header>

      <DossiersListClient
        demandes={demandes}
        agents={agents.map((a) => ({ id: a.id, nom: a.nom, prenom: a.prenom }))}
        role={profile.role}
        currentUserId={profile.id}
        baseDetailHref={`/dashboard/agent/dossiers/${params.categorie}`}
      />
    </DashboardShell>
  );
}
