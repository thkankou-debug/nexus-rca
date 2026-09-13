import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { RdvListClient } from "@/components/rdv/RdvListClient";
import { getAllRdvForRole, getAgentsForAssign } from "@/lib/rdv-server";

export const metadata = {
  title: "Rendez-vous | Nexus RCA",
};

export const dynamic = "force-dynamic";

// L5-1 : module unique, raccordé à AdminShell directement (le composant
// partagé ModuleAdminShell existe déjà depuis L4-2, pas de sous-étape
// séparée comme en L3). Le RLS de `appointments` scope déjà correctement
// par rôle (agent_id = auth.uid() OR admin/super_admin) — pas de filtre
// applicatif own/all à ajouter, contrairement à Dossiers/Clients.
export default async function RdvUniquePage() {
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

  const [appointments, agents, effectiveNav] = await Promise.all([
    getAllRdvForRole(profile),
    getAgentsForAssign(),
    getEffectiveNav(),
  ]);

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rendez-vous" }]}
      title="Rendez-vous"
      description={`${appointments.length} rendez-vous dans votre périmètre.`}
    >
      {appointments.length === 0 &&
        profile.role !== "agent" &&
        profile.role !== "admin" &&
        profile.role !== "super_admin" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Aucune permission de lecture de rendez-vous n&rsquo;est encore
            définie pour le rôle {profile.role}. Contactez un administrateur.
          </div>
        )}

      <RdvListClient
        appointments={appointments}
        agents={agents}
        role={profile.role}
        currentUserId={profile.id}
      />
    </ModuleAdminShell>
  );
}
