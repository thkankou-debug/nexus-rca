// ============================================================================
// LIB SERVER — Helpers de data fetching pour les pages staff /dossiers
// Mutualise les requêtes Supabase entre les 3 rôles (agent / admin / super-admin).
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES_DOSSIER,
  POLE_TO_CATEGORIES,
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
  let query = 
    supabase
      .from("demandes")
      .select("categorie_dossier, statut, urgence, traitement_prioritaire").eq("is_test", false);

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
    // P3 (migration 049a/049b) : "complete"/"nouveau" ont ete reassignes
    // vers la nouvelle machine a etats — voir docs/AUDIT_CRM.md. Etats
    // terminaux etendus a termine/refuse/archive en plus d'annule.
    if (
      r.statut === "complete" ||
      r.statut === "annule" ||
      r.statut === "termine" ||
      r.statut === "refuse" ||
      r.statut === "archive"
    )
      return;
    counters[cat].actifs += 1;
    if (r.statut === "nouveau" || r.statut === "nouvelle_demande") counters[cat].nouveaux += 1;
    if (r.urgence === "critique" || r.traitement_prioritaire)
      counters[cat].urgents += 1;
  });

  return counters;
}

/** Total global : actifs / urgents / non-assignés / demandes reçues (A6, Performance CRM) */
export async function getGlobalDossiersStats(filterAgentId?: string): Promise<{
  actifs: number;
  urgents: number;
  nonAssignes: number;
  demandesRecues: number;
}> {
  const supabase = createClient();
  let query = 
    supabase
      .from("demandes")
      .select("statut, urgence, traitement_prioritaire, agent_id").eq("is_test", false);

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
    if (
      r.statut === "complete" ||
      r.statut === "annule" ||
      r.statut === "termine" ||
      r.statut === "refuse" ||
      r.statut === "archive"
    )
      return;
    actifs++;
    if (r.urgence === "critique" || r.traitement_prioritaire) urgents++;
    if (!r.agent_id) nonAssignes++;
  });

  return { actifs, urgents, nonAssignes, demandesRecues: rows.length };
}

/**
 * Revenus par service (A6, Performance CRM) — somme de payments.montant_recu
 * groupée par payments.service. Réservé admin/super_admin (même restriction
 * que stats-agents et rapports) : un agent ne voit pas le chiffre d'affaires
 * global de l'agence.
 *
 * Délais moyens et dossiers en retard ne sont volontairement pas construits
 * ici : demande_status_history est vide (0 ligne réelle) et demandes.deadline
 * n'est renseigné sur aucune des 16 demandes réelles — aucune requête
 * honnête ne peut les produire aujourd'hui (voir docs/DETTE.md).
 */
export async function getRevenusParService(): Promise<
  Array<{ service: string; total: number; devise: string; nbPaiements: number }>
> {
  const supabase = createClient();
  const { data } = await 
    supabase.from("payments").select("service, montant_recu, devise").eq("is_test", false);

  const rows = (data || []) as Array<{
    service: string | null;
    montant_recu: number | string | null;
    devise: string | null;
  }>;

  const parService = new Map<
    string,
    { total: number; devise: string; nbPaiements: number }
  >();

  rows.forEach((r) => {
    const service = r.service || "Non précisé";
    const devise = r.devise || "XAF";
    const key = `${service}__${devise}`;
    const existing = parService.get(key) || { total: 0, devise, nbPaiements: 0 };
    existing.total += Number(r.montant_recu || 0);
    existing.nbPaiements += 1;
    parService.set(key, existing);
  });

  return Array.from(parService.entries())
    .map(([key, v]) => ({ service: key.split("__")[0], ...v }))
    .sort((a, b) => b.total - a.total);
}

/** Liste des dossiers d'une catégorie (avec ou sans filtre agent) */
export async function getDossiersByCategorie(
  categorie: CategorieDossier,
  filterAgentId?: string
): Promise<Demande[]> {
  const supabase = createClient();
  let query = 
    supabase
      .from("demandes")
      .select("*")
      .eq("categorie_dossier", categorie)
      .order("created_at", { ascending: false }).eq("is_test", false);

  if (filterAgentId) {
    query = query.eq("agent_id", filterAgentId);
  }

  const { data } = await query;
  return (data || []) as Demande[];
}

/**
 * Tous les dossiers (toutes catégories), scopés par rôle — module unique L3.
 *
 * Le RLS de `demandes` ("Staff can view all demandes") ne distingue pas les
 * portées own/service/all/partage promises par role_permissions (P2) : tout
 * rôle staff voit tout au niveau base. Ce filtre est donc appliqué ici, côté
 * application, en attendant un durcissement RLS séparé (voir docs/DETTE.md,
 * L3 Étape 2a) — pas une régression sur les pages existantes, qui ne
 * changent pas de comportement.
 *
 * `comptable`/`moderateur` n'ont aujourd'hui aucune permission `dossier.read.*`
 * dans le catalogue P2 : liste vide plutôt qu'un accès par défaut non écrit
 * nulle part.
 *
 * `is_test` du profil consultant détermine le filtre `is_test` des lignes :
 * un compte TEST_ (L2) doit voir ses propres dossiers de test dans son
 * propre périmètre (own/service) pour être réellement testable — la requête
 * reste bornée à son `agent_id`/`service_id`, donc ça ne fait fuiter aucune
 * donnée de test dans le périmètre d'un autre compte réel. Un compte réel
 * (is_test=false) ne voit jamais de donnée de test.
 */
export async function getAllDossiersForRole(profile: {
  id: string;
  role: string;
  service_id?: string | null;
  is_test?: boolean;
}): Promise<Demande[]> {
  const supabase = createClient();
  const includeTestRows = Boolean(profile.is_test);

  if (profile.role === "partenaire") {
    const { data: shares } = await supabase
      .from("dossier_partages")
      .select("demande_id")
      .eq("partenaire_id", profile.id);
    const ids = (shares || []).map((s) => (s as { demande_id: string }).demande_id);
    if (ids.length === 0) return [];
    let shareQuery = supabase
      .from("demandes")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });
    if (!includeTestRows) shareQuery = shareQuery.eq("is_test", false);
    const { data } = await shareQuery;
    return (data || []) as Demande[];
  }

  let query = supabase
    .from("demandes")
    .select("*")
    .order("created_at", { ascending: false });
  if (!includeTestRows) query = query.eq("is_test", false);

  if (profile.role === "chef_service") {
    if (!profile.service_id) return [];
    // Étape 6 (11/09/2026) : demandes.service_id est NULL sur tous les
    // dossiers réels — la portée par service_id seul était vide partout.
    // Élargie au pôle du service (categorie_dossier, renseignée sur toutes
    // les lignes) via le même mapping que l'écran Mon service
    // (lib/pilotage-server.ts). service_id reste prioritaire quand il sera
    // renseigné.
    const { data: svc } = await supabase
      .from("services")
      .select("categorie")
      .eq("id", profile.service_id)
      .single();
    const cats = svc ? POLE_TO_CATEGORIES[(svc as { categorie: string }).categorie] ?? [] : [];
    if (cats.length > 0) {
      query = query.or(
        `service_id.eq.${profile.service_id},categorie_dossier.in.(${cats.join(",")})`
      );
    } else {
      query = query.eq("service_id", profile.service_id);
    }
  } else if (profile.role === "agent") {
    query = query.eq("agent_id", profile.id);
  } else if (
    profile.role !== "super_admin" &&
    profile.role !== "admin" &&
    profile.role !== "dg" &&
    profile.role !== "daf"
  ) {
    // comptable, moderateur : aucune permission dossier.read.* seedée (P2)
    return [];
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
  const { data } = await 
    supabase
      .from("profiles")
      .select("id, nom, prenom, email, poste, specialites")
      .eq("role", "agent")
      .eq("actif", true)
      .order("nom", { ascending: true }).eq("is_test", false);
  return (data || []) as Array<{
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
    poste: string | null;
    specialites: string[] | null;
  }>;
}
