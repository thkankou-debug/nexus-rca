import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { CaisseSessionsManager, type CaisseSessionListItem } from "@/components/dashboard/CaisseSessionsManager";

export const metadata = {
  title: "Sessions caisse | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminCaisseSessionsPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("caisse_sessions")
    .select(
      "id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, profiles(nom, prenom)"
    )
    .order("opened_at", { ascending: false });

  if (error) console.error("[SUPER_ADMIN_CAISSE_SESSIONS] chargement:", error.message);
  const sessions = (data as unknown as CaisseSessionListItem[]) || [];
  const canClose = await hasPermission("caisse.close");

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Sessions caisse</h1>
          <p className="mt-1 text-slate-600">Toutes les sessions de caisse de l&apos;équipe.</p>
        </div>
      </div>

      <CaisseSessionsManager initialSessions={sessions} currentUserId={profile.id} canClose={canClose} />
    </DashboardShell>
  );
}
