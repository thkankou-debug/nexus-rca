import { PieChart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { FinancialDashboard } from "@/components/dashboard/FinancialDashboard";
import type { Payment } from "@/components/dashboard/PaymentForm";
import type { Expense } from "@/components/dashboard/ExpenseForm";

export const metadata = {
  title: "Tableau de bord financier | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminFinancesPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // Récupération en parallèle des paiements et dépenses
  const [paymentsResult, expensesResult] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (paymentsResult.error) {
    console.error("Erreur chargement paiements :", paymentsResult.error);
  }
  if (expensesResult.error) {
    console.error("Erreur chargement dépenses :", expensesResult.error);
  }

  const payments = (paymentsResult.data || []) as Payment[];
  const expenses = (expensesResult.data || []) as Expense[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-blue-700 text-white shadow-lg">
          <PieChart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Tableau de bord financier
          </h1>
          <p className="mt-1 text-slate-600">
            Vue d'ensemble des encaissements, dépenses et solde net de Nexus RCA.
          </p>
        </div>
      </div>

      <FinancialDashboard payments={payments} expenses={expenses} />
    </DashboardShell>
  );
}
