import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { DevisManager, type DevisListItem } from "@/components/dashboard/DevisManager";

export const metadata = {
  title: "Devis | Espace agent",
};

export const dynamic = "force-dynamic";

export default async function AgentDevisPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: ownDemandes } = await supabase
    .from("demandes")
    .select("id")
    .eq("agent_id", profile.id);
  const ids = (ownDemandes || []).map((d) => (d as { id: string }).id);

  let devis: DevisListItem[] = [];
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("devis")
      .select(
        "id, reference, status, amount, currency, valid_until, sent_at, accepted_at, created_at, demande_id, demandes(reference, nom_complet, service, agent_id)"
      )
      .in("demande_id", ids)
      .order("created_at", { ascending: false });
    if (error) console.error("[AGENT_DEVIS] chargement:", error.message);
    devis = (data as unknown as DevisListItem[]) || [];
  }

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/agent" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Devis</h1>
          <p className="mt-1 text-slate-600">Crée et suis les devis de tes dossiers.</p>
        </div>
      </div>

      <DevisManager initialDevis={devis} />
    </DashboardShell>
  );
}
