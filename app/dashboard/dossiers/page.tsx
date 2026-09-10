import { FolderOpen } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DossiersListClient } from "@/components/dossiers/DossiersListClient";
import { getActiveAgents, getAllDossiersForRole } from "@/lib/dossiers-server";

export const metadata = {
  title: "Dossiers | Nexus RCA",
};

export const dynamic = "force-dynamic";

// L3 Étape 2a/2b : page unique, pas encore raccordée à AdminShell (Étape 3)
// ni aux anciennes pages /dashboard/{agent,admin,super-admin}/dossiers, qui
// restent en place jusqu'à validation (Étape 4). "Voir"/"Assigner" par ligne
// pointent vers la fiche unique /dashboard/dossiers/[id] (Étape 2b) pour
// tout rôle ayant une permission dossier.read.* — comptable/moderateur
// exclus (aucune permission seedée, message dédié plus bas).
export default async function DossiersUniquePage() {
  const profile = await requireProfile([
    "super_admin",
    "admin",
    "dg",
    "daf",
    "chef_service",
    "agent",
    "comptable",
    "moderateur",
    "partenaire",
  ]);

  const [demandes, agents] = await Promise.all([
    getAllDossiersForRole(profile),
    getActiveAgents(),
  ]);

  const canViewDetail =
    profile.role !== "comptable" && profile.role !== "moderateur";
  const baseDetailHref = "/dashboard/dossiers";

  return (
    <DashboardShell profile={profile}>
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nexus-orange-100">
          <FolderOpen className="h-7 w-7 text-nexus-orange-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Module unique — L3
          </p>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Dossiers
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {demandes.length} dossier{demandes.length > 1 ? "s" : ""} dans votre
            périmètre.
          </p>
        </div>
      </header>

      {(profile.role === "comptable" || profile.role === "moderateur") && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aucune permission de lecture de dossiers n&rsquo;est encore définie
          pour le rôle {profile.role}. Contactez un administrateur.
        </div>
      )}
      {profile.role === "chef_service" && !profile.service_id && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aucun service n&rsquo;est rattaché à votre profil — impossible de
          déterminer les dossiers de votre périmètre. Contactez un
          administrateur.
        </div>
      )}

      <DossiersListClient
        demandes={demandes}
        agents={agents.map((a) => ({ id: a.id, nom: a.nom, prenom: a.prenom }))}
        role={profile.role}
        currentUserId={profile.id}
        baseDetailHref={baseDetailHref}
        canViewDetail={canViewDetail}
      />
    </DashboardShell>
  );
}
