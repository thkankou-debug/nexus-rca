import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { AgentStats, type AgentStatsRow } from "@/components/dashboard/AgentStats";

export const metadata = {
  title: "Agents | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  // Charger les agents et admins (pas les super_admin)
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom, role")
    .in("role", ["agent", "admin"])
    .eq("actif", true);

  const agents = agentsData || [];

  const stats: AgentStatsRow[] = await Promise.all(
    agents.map(async (agent) => {
      const [paymentsRes, clientsRes, demandesRes, expensesRes, transfertsRes] = await Promise.all([
        supabase
          .from("payments")
          .select("montant_recu, date_paiement, created_at")
          .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`),
        supabase
          .from("clients")
          .select("created_at")
          .eq("created_by", agent.id),
        supabase
          .from("demandes")
          .select("created_at")
          .or(`created_by.eq.${agent.id},assigne_a.eq.${agent.id}`),
        supabase
          .from("expenses")
          .select("date_depense, created_at, montant, statut")
          .eq("created_by", agent.id),
        supabase
          .from("transferts")
          .select("created_at")
          .or(`agent_id.eq.${agent.id},created_by.eq.${agent.id}`),
      ]);

      const paiements_dates = (paymentsRes.data || []).map((p) => ({
        date: p.date_paiement || p.created_at,
        montant: Number(p.montant_recu || 0),
      }));
      const clients_dates = (clientsRes.data || []).map((c) => c.created_at);
      const demandes_dates = (demandesRes.data || []).map((d) => d.created_at);
      const depenses_data = (expensesRes.data || []).map((d) => ({
        date: d.date_depense || d.created_at,
        montant: Number(d.montant || 0),
        statut: d.statut || "",
      }));
      const transferts_dates = (transfertsRes.data || []).map((t) => t.created_at);

      const paiements_encaisses = paiements_dates.reduce((s, p) => s + p.montant, 0);
      const depenses_validees = depenses_data
        .filter((d) => d.statut === "valide")
        .reduce((s, d) => s + d.montant, 0);

      const allDates = [
        ...paiements_dates.map((p) => p.date),
        ...clients_dates,
        ...demandes_dates,
        ...depenses_data.map((d) => d.date),
        ...transferts_dates,
      ].filter(Boolean);

      const derniere_activite =
        allDates.length > 0
          ? allDates.reduce((max, d) => (new Date(d) > new Date(max) ? d : max))
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

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/admin" label="Retour au tableau de bord" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Agents
          </h1>
          <p className="mt-1 text-slate-600">
            Performance, charge et activité de l'équipe opérationnelle.
          </p>
        </div>
      </div>

      <AgentStats rows={stats} />
    </DashboardShell>
  );
}
