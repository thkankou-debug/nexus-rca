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

  // 1. Agents
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom, role")
    .in("role", ["agent", "admin", "super_admin"])
    .eq("actif", true);

  const agents = agentsData || [];

  // 2. Pour chaque agent, calculer ses stats (avec donnees brutes pour filtrage)
  const stats: AgentStatsRow[] = await Promise.all(
    agents.map(async (agent) => {
      // Paiements
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("montant_recu, date_paiement, created_at")
        .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`);

      const paiements_dates = (paymentsData || []).map((p) => ({
        date: p.date_paiement || p.created_at,
        montant: Number(p.montant_recu || 0),
      }));

      // Clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("created_at")
        .eq("created_by", agent.id);

      const clients_dates = (clientsData || []).map((c) => c.created_at);

      // Demandes
      const { data: demandesData } = await supabase
        .from("demandes")
        .select("created_at")
        .or(`created_by.eq.${agent.id},assigne_a.eq.${agent.id}`);

      const demandes_dates = (demandesData || []).map((d) => d.created_at);

      // Depenses
      const { data: depensesData } = await supabase
        .from("expenses")
        .select("date_depense, created_at, montant, statut")
        .eq("created_by", agent.id);

      const depenses_data = (depensesData || []).map((d) => ({
        date: d.date_depense || d.created_at,
        montant: Number(d.montant || 0),
        statut: d.statut || "",
      }));

      // Transferts
      const { data: transfertsData } = await supabase
        .from("transferts")
        .select("created_at")
        .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`);

      const transferts_dates = (transfertsData || []).map((t) => t.created_at);

      // Stats globales (depuis le debut)
      const paiements_encaisses = paiements_dates.reduce(
        (s, p) => s + p.montant,
        0
      );
      const depenses_validees = depenses_data
        .filter((d) => d.statut === "valide")
        .reduce((s, d) => s + d.montant, 0);

      // Derniere activite = max de toutes les dates
      const allDates = [
        ...paiements_dates.map((p) => p.date),
        ...clients_dates,
        ...demandes_dates,
        ...depenses_data.map((d) => d.date),
        ...transferts_dates,
      ].filter(Boolean);

      const derniere_activite =
        allDates.length > 0
          ? allDates.reduce((max, d) =>
              new Date(d) > new Date(max) ? d : max
            )
          : null;

      return {
        id: agent.id,
        nom: agent.nom || "",
        prenom: agent.prenom,
        role: agent.role,
        paiements_encaisses,
        nb_paiements: paiements_dates.length,
        clients_crees: clients_dates.length,
        demandes_traitees: demandes_dates.length,
        depenses_validees,
        nb_depenses: depenses_data.length,
        transferts_inities: transferts_dates.length,
        paiements_dates,
        clients_dates,
        demandes_dates,
        depenses_data,
        transferts_dates,
        derniere_activite,
      };
    })
  );

  // 3. Filtrer ceux avec activite (ou rôle privilégié pour les voir tous)
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

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Performances des agents
          </h1>
          <p className="mt-1 text-slate-600">
            Suivi opérationnel et classement de l'équipe.
          </p>
        </div>
      </div>

      <AgentStats rows={statsActifs} />
    </DashboardShell>
  );
}
