import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { TransfertsManager } from "@/components/dashboard/TransfertsManager";
import type { Transfert } from "@/components/dashboard/TransfertForm";

export const metadata = {
  title: "Transferts | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminTransfertsPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  const { data: transfertsData, error } = await supabase
    .from("transferts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement transferts :", error);
  }
  const transferts = (transfertsData || []) as Transfert[];

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
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
            Validez les transferts initiés par les agents avant exécution.
          </p>
        </div>
      </div>

      <TransfertsManager
        initialTransferts={transferts}
        currentUserId={profile.id}
        canValidate={true}
      />
    </DashboardShell>
  );
}
