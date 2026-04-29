import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { QuickSalesManager } from "@/components/dashboard/QuickSalesManager";
import type { QuickSale } from "@/components/dashboard/QuickSaleForm";

export const metadata = {
  title: "Caisse rapide | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentCaissePage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  // RLS filtre deja les ventes (agent voit ses propres uniquement)
  const { data: salesData } = await supabase
    .from("quick_sales")
    .select("*")
    .order("date_paiement", { ascending: false });

  const sales = (salesData || []) as QuickSale[];

  // Agents pour affichage des noms
  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, nom, prenom")
    .in("role", ["agent", "admin", "super_admin"])
    .eq("actif", true);

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

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
            Caisse rapide
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Encaissement des petits services au comptoir : photocopies, scans, impressions...
          </p>
        </div>
      </div>

      <QuickSalesManager
        initialSales={sales}
        agents={agents}
        currentUserId={profile.id}
        showAgentColumn={false}
        showStats={false}
      />
    </DashboardShell>
  );
}
