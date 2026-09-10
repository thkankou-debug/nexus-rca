import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StaffDossierDetail } from "@/components/dossiers/StaffDossierDetail";
import { isCategorieDossier } from "@/lib/demande-categories";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

// L3 Étape 2b : fiche unique, dérive la catégorie de demandes.categorie_dossier
// (déjà une colonne) plutôt que de la répéter dans l'URL comme les 3 anciennes
// pages [categorie]/[id] — simplification permise par l'unification.
// comptable/moderateur exclus : aucune permission dossier.read.* (voir 2a).
export default async function DossierUniquePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile([
    "super_admin",
    "admin",
    "dg",
    "daf",
    "chef_service",
    "agent",
    "partenaire",
  ]);

  const supabase = createClient();

  const { data: demandeRow } = await supabase
    .from("demandes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!demandeRow) notFound();
  const demande = demandeRow as Demande;

  // Portée : même logique que lib/dossiers-server.ts getAllDossiersForRole,
  // appliquée ici en accès direct par id (RLS demandes ne la porte pas encore
  // — voir docs/DETTE.md, L3 Étape 2a point 3).
  if (profile.role === "agent" && demande.agent_id !== profile.id) notFound();
  if (
    profile.role === "chef_service" &&
    (!profile.service_id || demande.service_id !== profile.service_id)
  )
    notFound();
  if (profile.role === "partenaire") {
    const { data: share } = await supabase
      .from("dossier_partages")
      .select("id")
      .eq("demande_id", demande.id)
      .eq("partenaire_id", profile.id)
      .maybeSingle();
    if (!share) notFound();
  }

  const rawCategorie = demande.categorie_dossier || "";
  const categorieSlug = isCategorieDossier(rawCategorie) ? rawCategorie : "autres";

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

  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Dossiers", href: "/dashboard/dossiers" },
        { label: demande.reference || demande.id.slice(0, 8).toUpperCase() },
      ]}
      showHeader={false}
    >
      <StaffDossierDetail
        demande={demande}
        currentUserId={profile.id}
        role={profile.role}
        categorieSlug={categorieSlug}
        backHref="/dashboard/dossiers"
        agentInfo={agentInfo}
        history={(historyRows || []) as Array<{ step: number; created_at: string }>}
        payments={paymentsRows ?? []}
        appointments={appointmentsRows ?? []}
      />
    </ModuleAdminShell>
  );
}
