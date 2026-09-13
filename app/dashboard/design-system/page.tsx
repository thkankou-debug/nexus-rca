import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { getATraiter, getPipeline, getAujourdhui, getAlertes } from "@/lib/dashboard-blocks";
import { DesignSystemShowcase } from "./DesignSystemShowcase";

// Vitrine interne du design system admin (Phases A2 + A3 + A4). Réservée
// super_admin. À retirer en P12 une fois la migration des pages admin
// terminée.
export default async function DesignSystemPage() {
  const profile = await requireProfile(["super_admin"]);
  const effectiveNav = await getEffectiveNav();

  const supabase = createClient();
  const { data: demandesData } = await supabase
    .from("demandes")
    .select("id, reference, nom_complet, statut, urgence, traitement_prioritaire, deadline, agent_id, created_at")
    .order("created_at", { ascending: false });
  const demandes = demandesData ?? [];

  const [aTraiter, pipeline, aujourdhui, alertes] = await Promise.all([
    getATraiter(),
    getPipeline(),
    getAujourdhui(),
    getAlertes(),
  ]);

  return (
    <DesignSystemShowcase
      profile={profile}
      effectiveNav={effectiveNav}
      demandes={demandes}
      aTraiter={aTraiter}
      pipeline={pipeline}
      aujourdhui={aujourdhui}
      alertes={alertes}
    />
  );
}
