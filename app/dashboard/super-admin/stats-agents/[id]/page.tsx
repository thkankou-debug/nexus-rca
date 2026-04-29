import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  AgentDetailView,
  type AgentDetailData,
} from "@/components/dashboard/AgentDetailView";

export const metadata = {
  title: "Fiche agent | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // Verifier que l agent existe
  const { data: agentData } = await supabase
    .from("profiles")
    .select("id, nom, prenom, email, role")
    .eq("id", params.id)
    .single();

  if (!agentData) notFound();

  // Charger ses donnees
  const [paiementsRes, clientsRes, demandesRes, transfertsRes, depensesRes] =
    await Promise.all([
      supabase
        .from("payments")
        .select(
          "id, reference, client_nom, service, montant_recu, devise, statut, date_paiement"
        )
        .or(`agent_id.eq.${params.id},created_by.eq.${params.id}`)
        .order("date_paiement", { ascending: false }),
      supabase
        .from("clients")
        .select("id, reference, nom, prenom, type, created_at")
        .eq("created_by", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("demandes")
        .select("id, objet, service, statut, created_at")
        .or(`created_by.eq.${params.id},assigne_a.eq.${params.id}`)
        .order("created_at", { ascending: false }),
      supabase
        .from("transferts")
        .select(
          "id, reference, expediteur_nom, beneficiaire_nom, beneficiaire_pays, montant_envoye, devise, statut, created_at"
        )
        .or(`agent_id.eq.${params.id},created_by.eq.${params.id}`)
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select("id, reference, motif, montant, devise, statut, date_depense")
        .eq("created_by", params.id)
        .order("date_depense", { ascending: false }),
    ]);

  const data: AgentDetailData = {
    agent: agentData,
    paiements: (paiementsRes.data || []) as AgentDetailData["paiements"],
    clients: (clientsRes.data || []) as AgentDetailData["clients"],
    demandes: (demandesRes.data || []) as AgentDetailData["demandes"],
    transferts: (transfertsRes.data || []) as AgentDetailData["transferts"],
    depenses: (depensesRes.data || []) as AgentDetailData["depenses"],
  };

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/stats-agents"
        label="Retour au classement"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
            Fiche agent
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Détail des opérations et performance individuelle.
          </p>
        </div>
      </div>

      <AgentDetailView data={data} />
    </DashboardShell>
  );
}
