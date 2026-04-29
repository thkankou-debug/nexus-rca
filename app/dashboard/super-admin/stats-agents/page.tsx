import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { AgentStats, type AgentStatsRow } from "@/components/dashboard/AgentStats";

export const metadata = {
  title: "Stats agents | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function StatsAgentsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // 1. Recuperer tous les agents/admins/super_admins actifs
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom, role")
    .in("role", ["agent", "admin", "super_admin"])
    .eq("actif", true);

  const agents = agentsData || [];

  // 2. Pour chaque agent, calculer ses stats en parallele
  const stats: AgentStatsRow[] = await Promise.all(
    agents.map(async (agent) => {
      // Paiements encaisses (en tant qu agent_id ou created_by)
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("montant_recu")
        .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`);

      const paiements_encaisses = (paymentsData || []).reduce(
        (sum, p) => sum + Number(p.montant_recu || 0),
        0
      );
      const nb_paiements = (paymentsData || []).length;

      // Clients crees
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("created_by", agent.id);

      // Demandes traitees (approximation : demandes ou cet agent a fait un paiement
      // ou cree le client - facile a affiner plus tard)
      // Pour l instant on compte les demandes ou il est marque comme created_by ou agent
      const { count: demandesCount } = await supabase
        .from("demandes")
        .select("*", { count: "exact", head: true })
        .or(
          `created_by.eq.${agent.id},assigne_a.eq.${agent.id}`
        );

      // Depenses validees (montant total) creees par cet agent
      const { data: depensesData } = await supabase
        .from("expenses")
        .select("montant, statut")
        .eq("created_by", agent.id);

      const depenses_validees = (depensesData || [])
        .filter((d) => d.statut === "valide")
        .reduce((sum, d) => sum + Number(d.montant || 0), 0);

      const nb_depenses = (depensesData || []).length;

      // Transferts inities
      const { count: transfertsCount } = await supabase
        .from("transferts")
        .select("*", { count: "exact", head: true })
        .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`);

      return {
        id: agent.id,
        nom: agent.nom || "",
        prenom: agent.prenom,
        role: agent.role,
        paiements_encaisses,
        nb_paiements,
        clients_crees: clientsCount ?? 0,
        demandes_traitees: demandesCount ?? 0,
        depenses_validees,
        nb_depenses,
        transferts_inities: transfertsCount ?? 0,
      };
    })
  );

  // 3. Filtrer ceux qui n ont aucune activite (optionnel - tu peux retirer si tu veux tout voir)
  const statsActifs = stats.filter(
    (s) =>
      s.paiements_encaisses > 0 ||
      s.clients_crees > 0 ||
      s.demandes_traitees > 0 ||
      s.transferts_inities > 0 ||
      s.nb_depenses > 0
  );

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Performances des agents
          </h1>
          <p className="mt-1 text-slate-600">
            Classement et statistiques individuelles depuis le début.
          </p>
        </div>
      </div>

      <AgentStats rows={statsActifs} />
    </DashboardShell>
  );
}
