import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { CaisseSessionsManager, type CaisseSessionListItem } from "@/components/dashboard/CaisseSessionsManager";

export const metadata = {
  title: "Sessions caisse | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentCaisseSessionsPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("caisse_sessions")
    .select(
      "id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, profiles(nom, prenom)"
    )
    .eq("agent_id", profile.id)
    .order("opened_at", { ascending: false });

  if (error) console.error("[AGENT_CAISSE_SESSIONS] chargement:", error.message);
  const sessions = (data as unknown as CaisseSessionListItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/agent" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Sessions caisse</h1>
          <p className="mt-1 text-slate-600">Ouvre et clôture tes sessions de caisse.</p>
        </div>
      </div>

      <CaisseSessionsManager initialSessions={sessions} currentUserId={profile.id} />
    </DashboardShell>
  );
}
