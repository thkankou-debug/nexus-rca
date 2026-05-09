// ============================================================================
// LIB SERVER — Helpers de data fetching pour les pages staff /dossiers
// Mutualise les requêtes Supabase entre les 3 rôles (agent / admin / super-admin).
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES_DOSSIER,
  type CategorieDossier,
} from "@/lib/demande-categories";
import type { Demande } from "@/types";

/**
 * Compteurs par catégorie pour le dashboard staff.
 * Si filterAgentId est fourni, on ne compte que les dossiers de cet agent.
 */
export async function getCategoryCounters(filterAgentId?: string): Promise<
  Record<
    CategorieDossier,
    { actifs: number; nouveaux: number; urgents: number }
  >
> {
  const supabase = createClient();
  let query = supabase
    .from("demandes")
    .select("categorie_dossier, statut, urgence, traitement_prioritaire");

  if (filterAgentId) {
    query = query.eq("agent_id", filterAgentId);
  }

  const { data } = await query;
  const rows = (data || []) as Array<{
    categorie_dossier: string | null;
    statut: string;
    urgence: string;
    traitement_prioritaire: boolean;
  }>;

  const init = () => ({ actifs: 0, nouveaux: 0, urgents: 0 });
  const counters = Object.fromEntries(
    CATEGORIES_DOSSIER.map((c) => [c, init()])
  ) as Record<CategorieDossier, { actifs: number; nouveaux: number; urgents: number }>;

  rows.forEach((r) => {
    const cat = (CATEGORIES_DOSSIER as readonly string[]).includes(
      r.categorie_dossier ?? ""
    )
      ? (r.categorie_dossier as CategorieDossier)
      : "autres";
    if (
      r.statut === "complete" ||
      r.statut === "annule"
    )
      return;
    counters[cat].actifs += 1;
    if (r.statut === "nouveau") counters[cat].nouveaux += 1;
    if (r.urgence === "critique" || r.traitement_prioritaire)
      counters[cat].urgents += 1;
  });

  return counters;
}

/** Total global : actifs / urgents / non-assignés */
export async function getGlobalDossiersStats(filterAgentId?: string): Promise<{
  actifs: number;
  urgents: number;
  nonAssignes: number;
}> {
  const supabase = createClient();
  let query = supabase
    .from("demandes")
    .select("statut, urgence, traitement_prioritaire, agent_id");

  if (filterAgentId) {
    query = query.eq("agent_id", filterAgentId);
  }

  const { data } = await query;
  const rows = (data || []) as Array<{
    statut: string;
    urgence: string;
    traitement_prioritaire: boolean;
    agent_id: string | null;
  }>;

  let actifs = 0;
  let urgents = 0;
  let nonAssignes = 0;
  rows.forEach((r) => {
    if (r.statut === "complete" || r.statut === "annule") return;
    actifs++;
    if (r.urgence === "critique" || r.traitement_prioritaire) urgents++;
    if (!r.agent_id) nonAssignes++;
  });

  return { actifs, urgents, nonAssignes };
}

/** Liste des dossiers d'une catégorie (avec ou sans filtre agent) */
export async function getDossiersByCategorie(
  categorie: CategorieDossier,
  filterAgentId?: string
): Promise<Demande[]> {
  const supabase = createClient();
  let query = supabase
    .from("demandes")
    .select("*")
    .eq("categorie_dossier", categorie)
    .order("created_at", { ascending: false });

  if (filterAgentId) {
    query = query.eq("agent_id", filterAgentId);
  }

  const { data } = await query;
  return (data || []) as Demande[];
}

/** Tous les agents actifs (pour les dropdowns / pages assigner) */
export async function getActiveAgents(): Promise<
  Array<{
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
    poste: string | null;
    specialites: string[] | null;
  }>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nom, prenom, email, poste, specialites")
    .eq("role", "agent")
    .eq("actif", true)
    .order("nom", { ascending: true });
  return (data || []) as Array<{
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
    poste: string | null;
    specialites: string[] | null;
  }>;
}
