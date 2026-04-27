import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ExpensesManager } from "@/components/dashboard/ExpensesManager";
import type { Expense } from "@/components/dashboard/ExpenseForm";

export const metadata = {
  title: "Dépenses internes | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminExpensesPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const { data: expensesData, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement dépenses :", error);
  }
  const expenses = (expensesData || []) as Expense[];

  const employeeNom = `${profile.prenom || ""} ${profile.nom}`.trim();

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Dépenses internes
          </h1>
          <p className="mt-1 text-slate-600">
            Suivi des dépenses de l'équipe Nexus : validation, rejet, traçabilité.
          </p>
        </div>
      </div>

      <ExpensesManager
        initialExpenses={expenses}
        currentUserId={profile.id}
        currentUserName={employeeNom}
        canValidate={profile.role === "super_admin"}
        canDelete={profile.role === "super_admin"}
      />
    </DashboardShell>
  );
}
