import { Send, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { TransfertsManager } from "@/components/dashboard/TransfertsManager";
import type { Transfert } from "@/components/dashboard/TransfertForm";

export const metadata = {
  title: "Transferts | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentTransfertsPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: transfertsData, error } = await supabase
    .from("transferts")
    .select("*")
    .or(`created_by.eq.${profile.id},agent_id.eq.${profile.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement transferts :", error);
  }
  const transferts = (transfertsData || []) as Transfert[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 text-white shadow-lg">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Transferts d'argent
          </h1>
          <p className="mt-1 text-slate-600">
            Initiez un transfert. Il sera validé par un super-admin avant exécution.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <strong>Workflow :</strong> chaque transfert que tu remplis est envoyé
          en validation au super-admin. Une fois validé, tu peux procéder à
          l'envoi via Western Union, MoneyGram, etc. puis marquer comme effectué.
        </div>
      </div>

      <TransfertsManager
        initialTransferts={transferts}
        currentUserId={profile.id}
        canValidate={false}
      />
    </DashboardShell>
  );
}
