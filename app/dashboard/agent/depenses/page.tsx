import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { MyExpensesView } from "@/components/dashboard/MyExpensesView";
import type { Expense } from "@/components/dashboard/ExpenseForm";

export const metadata = {
  title: "Mes dépenses | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentExpensesPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  // RLS filtrera automatiquement pour ne renvoyer que les dépenses de l'utilisateur
  // (sauf admin/super_admin qui voient tout — on filtre manuellement)
  const { data: expensesData, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("employee_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement mes dépenses :", error);
  }
  const expenses = (expensesData || []) as Expense[];

  const employeeNom = `${profile.prenom || ""} ${profile.nom}`.trim();

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref={`/dashboard/${profile.role.replace("_", "-")}`}
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Mes dépenses
          </h1>
          <p className="mt-1 text-slate-600">
            Soumets et suis les dépenses que tu as faites pour Nexus RCA.
          </p>
        </div>
      </div>

      <MyExpensesView
        initialExpenses={expenses}
        currentUserId={profile.id}
        currentUserName={employeeNom}
      />
    </DashboardShell>
  );
}
