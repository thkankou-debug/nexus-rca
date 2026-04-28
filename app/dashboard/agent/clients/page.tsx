import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ClientsManager } from "@/components/dashboard/ClientsManager";
import type { Client } from "@/types/client-types";

export const metadata = {
  title: "Clients | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentClientsPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: clientsData, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement clients :", error);
  }
  const clients = (clientsData || []) as Client[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Clients
          </h1>
          <p className="mt-1 text-slate-600">
            Créez et consultez les fiches clients de l'agence.
          </p>
        </div>
      </div>

      {/* Agent : pas de droit de suppression */}
      <ClientsManager
        initialClients={clients}
        currentUserId={profile.id}
        canDelete={false}
      />
    </DashboardShell>
  );
}
