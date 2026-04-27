import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PaymentsManager } from "@/components/dashboard/PaymentsManager";
import type { Payment } from "@/components/dashboard/PaymentForm";
import type { Profile } from "@/types";

export const metadata = {
  title: "Paiements clients | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminPaymentsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // Récupération des paiements
  const { data: paymentsData, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement paiements :", error);
  }
  const payments = (paymentsData || []) as Payment[];

  // Récupération des agents (staff Nexus)
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom")
    .in("role", ["agent", "admin", "super_admin"])
    .order("prenom", { ascending: true });

  const agents = (agentsData || []) as Pick<Profile, "id" | "nom" | "prenom">[];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Paiements clients
          </h1>
          <p className="mt-1 text-slate-600">
            Suivi complet des encaissements : montants, statuts, agents et reçus.
          </p>
        </div>
      </div>

      <PaymentsManager
        initialPayments={payments}
        agents={agents}
        currentUserId={profile.id}
        canDelete={profile.role === "super_admin"}
      />
    </DashboardShell>
  );
}
