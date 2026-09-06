import { Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { CommissionsManager, type CommissionListItem } from "@/components/dashboard/CommissionsManager";

export const metadata = {
  title: "Mes commissions | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentCommissionsPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("commissions")
    .select(
      "id, agent_id, demande_id, payment_id, amount, rate, status, validated_at, created_at, profiles!commissions_agent_id_fkey(nom, prenom), demandes(reference, service)"
    )
    .eq("agent_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) console.error("[AGENT_COMMISSIONS] chargement:", error.message);
  const commissions = (data as unknown as CommissionListItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/agent" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Mes commissions</h1>
          <p className="mt-1 text-slate-600">Suivi de tes commissions calculées, validées et payées.</p>
        </div>
      </div>

      <CommissionsManager initialCommissions={commissions} canCreate={false} />
    </DashboardShell>
  );
}
