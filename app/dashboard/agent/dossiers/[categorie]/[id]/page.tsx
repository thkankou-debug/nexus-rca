import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffDossierDetail } from "@/components/dossiers/StaffDossierDetail";
import { isCategorieDossier } from "@/lib/demande-categories";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function AgentDossierDetailPage({
  params,
}: {
  params: { categorie: string; id: string };
}) {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  if (!isCategorieDossier(params.categorie)) notFound();

  const supabase = createClient();

  const { data: demandeRow } = await supabase
    .from("demandes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!demandeRow) notFound();
  const demande = demandeRow as Demande;

  // Conseiller assigné
  let agentInfo = null;
  if (demande.agent_id) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, nom, prenom, email, telephone, poste, avatar_url")
      .eq("id", demande.agent_id)
      .single();
    agentInfo = (agentData as typeof agentInfo) || null;
  }

  // History
  const { data: historyRows } = await supabase
    .from("demande_status_history")
    .select("step, created_at")
    .eq("demande_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <DashboardShell profile={profile}>
      <StaffDossierDetail
        demande={demande}
        currentUserId={profile.id}
        role={profile.role}
        categorieSlug={params.categorie}
        backHref={`/dashboard/agent/dossiers/${params.categorie}`}
        agentInfo={agentInfo}
        history={(historyRows || []) as Array<{ step: number; created_at: string }>}
      />
    </DashboardShell>
  );
}
