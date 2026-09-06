import { CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EcheanciersManager, type EcheancierListItem } from "@/components/dashboard/EcheanciersManager";

export const metadata = {
  title: "Échéanciers | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminEcheanciersPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("echeanciers")
    .select(
      "id, facture_id, amount, due_date, status, paid_at, factures(reference, amount, currency, status, demandes(reference, nom_complet, service, agent_id))"
    )
    .order("due_date", { ascending: true });

  if (error) console.error("[SUPER_ADMIN_ECHEANCIERS] chargement:", error.message);
  const echeanciers = (data as unknown as EcheancierListItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Échéanciers</h1>
          <p className="mt-1 text-slate-600">Toutes les échéances de facturation, reste dû inclus.</p>
        </div>
      </div>

      <EcheanciersManager initialEcheanciers={echeanciers} canMarkPaid />
    </DashboardShell>
  );
}
