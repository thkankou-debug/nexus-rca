import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { DossiersListClient } from "@/components/dossiers/DossiersListClient";
import { getActiveAgents, getAllDossiersForRole } from "@/lib/dossiers-server";

export const metadata = {
  title: "Dossiers | Nexus RCA",
};

export const dynamic = "force-dynamic";

// L3 Étape 3 : raccordée à AdminShell (premier module réel, voir
// docs/DETTE.md). Les anciennes pages /dashboard/{agent,admin,super-admin}/
// dossiers restent en place jusqu'à validation (Étape 4). "Voir"/"Assigner"
// par ligne pointent vers la fiche unique /dashboard/dossiers/[id] (Étape 2b)
// pour tout rôle ayant une permission dossier.read.* — comptable/moderateur
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

  const [demandes, agents, effectiveNav] = await Promise.all([
    getAllDossiersForRole(profile),
    getActiveAgents(),
    getEffectiveNav(),
  ]);

  const canViewDetail =
    profile.role !== "comptable" && profile.role !== "moderateur";
  const baseDetailHref = "/dashboard/dossiers";

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Dossiers" }]}
      title="Dossiers"
      description={`${demandes.length} dossier${demandes.length > 1 ? "s" : ""} dans votre périmètre.`}
    >
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
    </ModuleAdminShell>
  );
}
