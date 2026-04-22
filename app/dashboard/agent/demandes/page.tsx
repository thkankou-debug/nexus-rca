import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function AgentDemandesPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data } = await supabase
    .from("demandes")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (data || []) as Demande[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Demandes clients
        </h1>
        <p className="mt-1 text-slate-600">
          Toutes les demandes reçues — mettez à jour leur statut et ajoutez des notes.
        </p>
      </div>
      <DemandesManager initialDemandes={list} />
    </DashboardShell>
  );
}
