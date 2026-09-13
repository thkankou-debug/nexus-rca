import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { ClientsManager } from "@/components/dashboard/ClientsManager";
import { getAllClientsForRole } from "@/lib/clients-server";

export const metadata = {
  title: "Clients | Nexus RCA",
};

export const dynamic = "force-dynamic";

// L4-2 : raccordée à AdminShell (ModuleAdminShell, partagé avec Dossiers —
// voir docs/DETTE.md). Les anciennes pages (agent/admin/super-admin)
// restent en place. Portée appliquée côté application
// (lib/clients-server.ts) — RLS non touché, même choix qu'en L3.
export default async function ClientsUniquePage() {
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

  const [clients, effectiveNav] = await Promise.all([
    getAllClientsForRole(profile),
    getEffectiveNav(),
  ]);
  const canViewAny =
    profile.role === "super_admin" ||
    profile.role === "admin" ||
    profile.role === "agent";

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients" }]}
      title="Clients"
      description={`${clients.length} client${clients.length > 1 ? "s" : ""} dans votre périmètre.`}
    >
      {!canViewAny && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aucune permission de lecture de clients n&rsquo;est encore définie
          pour le rôle {profile.role}. Contactez un administrateur.
        </div>
      )}

      <ClientsManager
        initialClients={clients}
        currentUserId={profile.id}
        canDelete={profile.role === "super_admin"}
      />
    </ModuleAdminShell>
  );
}
