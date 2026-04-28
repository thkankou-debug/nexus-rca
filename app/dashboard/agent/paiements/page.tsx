import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PaymentsManager } from "@/components/dashboard/PaymentsManager";
import type { Payment } from "@/components/dashboard/PaymentForm";

export const metadata = {
  title: "Paiements | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentPaiementsPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  // Charger les paiements (RLS appliquera les bons droits)
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (paymentsError) {
    console.error("Erreur chargement paiements :", paymentsError);
  }
  const payments = (paymentsData || []) as Payment[];

  // Charger la liste des agents pour le selecteur dans le formulaire
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom, role")
    .in("role", ["agent", "admin", "super_admin"])
    .eq("actif", true)
    .order("nom");

  const agents = (agentsData || []).map((a) => ({
    id: a.id,
    nom: a.nom || "",
    prenom: a.prenom,
  }));

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Paiements
          </h1>
          <p className="mt-1 text-slate-600">
            Encaissez les paiements clients et consultez l'historique.
          </p>
        </div>
      </div>

      {/* Agent : pas de droit de suppression */}
      <PaymentsManager
        initialPayments={payments}
        agents={agents}
        currentUserId={profile.id}
        canDelete={false}
      />
    </DashboardShell>
  );
}
