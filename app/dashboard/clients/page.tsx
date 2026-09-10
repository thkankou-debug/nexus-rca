import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ClientsManager } from "@/components/dashboard/ClientsManager";
import { getAllClientsForRole } from "@/lib/clients-server";

export const metadata = {
  title: "Clients | Nexus RCA",
};

export const dynamic = "force-dynamic";

// L4-1 : page unique, pas encore raccordée à AdminShell ni aux anciennes
// pages (agent/admin/super-admin), qui restent en place. Portée appliquée
// côté application (lib/clients-server.ts) — RLS non touché, même choix
// qu'en L3 (voir docs/DETTE.md).
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

  const clients = await getAllClientsForRole(profile);
  const canViewAny =
    profile.role === "super_admin" ||
    profile.role === "admin" ||
    profile.role === "agent";

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Clients
          </h1>
          <p className="mt-1 text-slate-600">
            {clients.length} client{clients.length > 1 ? "s" : ""} dans votre
            périmètre.
          </p>
        </div>
      </div>

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
    </DashboardShell>
  );
}
