import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { QuickSalesManager } from "@/components/dashboard/QuickSalesManager";
import type { QuickSale } from "@/components/dashboard/QuickSaleForm";

export const metadata = {
  title: "Caisse rapide | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminCaissePage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const { data: salesData } = await supabase
    .from("quick_sales")
    .select("*")
    .order("date_paiement", { ascending: false });

  const sales = (salesData || []) as QuickSale[];

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
        fallbackHref="/dashboard/super-admin"
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
            Vue globale des ventes au comptoir : analyse par service et par agent.
          </p>
        </div>
      </div>

      <QuickSalesManager
        initialSales={sales}
        agents={agents}
        currentUserId={profile.id}
        showAgentColumn={true}
        showStats={true}
      />
    </DashboardShell>
  );
}
