import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffDossierDetail } from "@/components/dossiers/StaffDossierDetail";
import { isCategorieDossier } from "@/lib/demande-categories";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function SuperAdminDossierDetailPage({
  params,
}: {
  params: { categorie: string; id: string };
}) {
  const profile = await requireProfile(["super_admin"]);
  if (!isCategorieDossier(params.categorie)) notFound();

  const supabase = createClient();

  const { data: demandeRow } = await supabase
    .from("demandes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!demandeRow) notFound();
  const demande = demandeRow as Demande;

  let agentInfo = null;
  if (demande.agent_id) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, nom, prenom, email, telephone, poste, avatar_url")
      .eq("id", demande.agent_id)
      .single();
    agentInfo = (agentData as typeof agentInfo) || null;
  }

  const { data: historyRows } = await supabase
    .from("demande_status_history")
    .select("step, created_at")
    .eq("demande_id", params.id)
    .order("created_at", { ascending: true });

  const { data: paymentsRows } = await supabase
    .from("payments")
    .select("id, reference, amount, currency, status, method, created_at")
    .eq("demande_id", params.id)
    .order("created_at", { ascending: false });

  const { data: appointmentsRows } = demande.client_id
    ? await supabase
        .from("appointments")
        .select("id, reference, rdv_date, rdv_heure, statut, service_type")
        .eq("client_id", demande.client_id)
        .order("rdv_date", { ascending: false })
    : { data: [] };

  return (
    <DashboardShell profile={profile}>
      <StaffDossierDetail
        demande={demande}
        currentUserId={profile.id}
        role={profile.role}
        categorieSlug={params.categorie}
        backHref={`/dashboard/super-admin/dossiers/${params.categorie}`}
        agentInfo={agentInfo}
        history={(historyRows || []) as Array<{ step: number; created_at: string }>}
        payments={paymentsRows ?? []}
        appointments={appointmentsRows ?? []}
      />
    </DashboardShell>
  );
}
