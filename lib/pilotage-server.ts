// ============================================================================
// LIB SERVER — Étape 6 : espaces DG (Pilotage) et Responsable de service
// (Mon service). NEXUS_RCA_DASHBOARD_ADMINISTRATION.md §2.3/§2.7.
//
// Périmètre du chef de service : demandes.service_id est NULL sur TOUS les
// dossiers réels (vérifié le 11/09/2026) — la portée L3 par service_id seul
// serait vide partout. Le périmètre réellement mesurable est le PÔLE :
// profiles.service_id → services.categorie → categorie_dossier (colonne
// propre et renseignée sur 19/19 dossiers). Mapping déclaré ici, documenté
// dans docs/DETTE.md ; demandes.service_id reste prioritaire quand il sera
// renseigné un jour.
// ============================================================================

import type { CategorieDossier } from "@/lib/demande-categories";
import { POLE_TO_CATEGORIES } from "@/lib/demande-categories";
import { getFinanceAdminClient } from "@/lib/finance-server";

// Le mapping pôle → catégories vit dans lib/demande-categories.ts (pur,
// sans dépendance Supabase — consommé aussi par lib/dossiers-server.ts).
export { POLE_TO_CATEGORIES };

export const STATUTS_TERMINAUX = ["termine", "complete", "refuse", "annule", "archive"];

export interface ServiceScope {
  serviceId: string;
  serviceNom: string;
  categorie: string;
  /** Catégories de dossiers du pôle (peut être vide). */
  dossierCategories: CategorieDossier[];
}

/**
 * Résout le périmètre du chef de service depuis son profil.
 * Renvoie null si aucun service n'est rattaché au profil.
 */
export async function getServiceScope(profile: {
  service_id?: string | null;
}): Promise<ServiceScope | null> {
  if (!profile.service_id) return null;
  const admin = getFinanceAdminClient();
  const { data: service } = await admin
    .from("services")
    .select("id, nom, categorie")
    .eq("id", profile.service_id)
    .single();
  if (!service) return null;
  const row = service as { id: string; nom: string; categorie: string };
  return {
    serviceId: row.id,
    serviceNom: row.nom,
    categorie: row.categorie,
    dossierCategories: POLE_TO_CATEGORIES[row.categorie] ?? [],
  };
}
