// ============================================================================
// TABLEAU DE BORD — A4
//
// Quatre blocs (À traiter, Pipeline, Aujourd'hui, Alertes). Chaque nombre
// affiché est produit par une requête citée en commentaire juste au-dessus —
// règle explicite de la feuille de route : « si elle ne peut pas être citée,
// le nombre est retiré ». Aucun bloc financier (décision D1), aucune
// variation en %, aucun score de performance/satisfaction.
//
// Écart constaté en vérifiant les données réelles avant d'écrire ce fichier :
// l'alerte « documents rejetés sans relance » prévue par la feuille de route
// est IMPOSSIBLE à produire — demande_documents n'a aucune colonne de
// validation, et demande_documents_requests.statut n'admet que
// ('en_attente', 'fourni', 'annule') par contrainte CHECK, aucun état
// "rejeté" n'existe dans le schéma. Retirée, pas simulée.
// ============================================================================

import { createClient } from "@/lib/supabase/server";

const TERMINAL_STATUTS = ["termine", "refuse", "annule", "archive", "complete"];
const PAIEMENT_ATTENTE_SEUIL_JOURS = 3;
const SANS_AGENT_SEUIL_HEURES = 48;

// ── Bloc 1 : À traiter ──────────────────────────────────────────────────
export interface ATraiterCounters {
  nouvelles: number;
  attenteClient: number;
  enTraitement: number;
  enRetard: number;
}

/**
 * Une seule requête agrégée (pas 4 allers-retours). Valeurs d'enum alignées
 * sur les 15 statuts réels de demande_status (migration 049a/049b) :
 *
 *   select
 *     count(*) filter (where statut = 'nouvelle_demande' and agent_id is null) as nouvelles,
 *     count(*) filter (where statut in ('documents_demandes','dossier_incomplet','paiement_attente')) as attente_client,
 *     count(*) filter (where statut in ('qualification','traitement','transmis_partenaire')) as en_traitement,
 *     count(*) filter (where deadline < now() and statut not in ('termine','refuse','annule','archive')) as en_retard
 *   from demandes;
 */
export async function getATraiter(): Promise<ATraiterCounters> {
  const supabase = createClient();
  const { data } = await supabase
    .from("demandes")
    .select("statut, agent_id, deadline");

  const rows = data ?? [];
  const now = Date.now();

  let nouvelles = 0;
  let attenteClient = 0;
  let enTraitement = 0;
  let enRetard = 0;

  for (const r of rows) {
    if (r.statut === "nouvelle_demande" && !r.agent_id) nouvelles++;
    if (["documents_demandes", "dossier_incomplet", "paiement_attente"].includes(r.statut)) attenteClient++;
    if (["qualification", "traitement", "transmis_partenaire"].includes(r.statut)) enTraitement++;
    if (r.deadline && new Date(r.deadline).getTime() < now && !TERMINAL_STATUTS.includes(r.statut)) enRetard++;
  }

  return { nouvelles, attenteClient, enTraitement, enRetard };
}

// ── Bloc 2 : Pipeline ────────────────────────────────────────────────────
export interface PipelineCount {
  statut: string;
  count: number;
}

const PIPELINE_STATUTS = [
  "nouvelle_demande",
  "qualification",
  "documents_demandes",
  "dossier_incomplet",
  "etude_faisabilite",
  "devis_envoye",
  "devis_accepte",
  "paiement_attente",
  "traitement",
  "transmis_partenaire",
  "decision_recue",
  "termine",
  "refuse",
  "annule",
  "archive",
];

/**
 *   select statut, count(*) from demandes group by statut;
 * Les statuts non représentés dans les données réelles sont inclus à 0 —
 * « l'information utile », pas une case vide masquée.
 */
export async function getPipeline(): Promise<PipelineCount[]> {
  const supabase = createClient();
  const { data } = await supabase.from("demandes").select("statut");
  const rows = data ?? [];

  const counts = new Map(PIPELINE_STATUTS.map((s) => [s, 0]));
  for (const r of rows) {
    counts.set(r.statut, (counts.get(r.statut) ?? 0) + 1);
  }

  return PIPELINE_STATUTS.map((statut) => ({ statut, count: counts.get(statut) ?? 0 }));
}

// ── Bloc 3 : Aujourd'hui ─────────────────────────────────────────────────
export interface ActiviteRecente {
  id: string;
  type: "demande" | "statut" | "paiement";
  label: string;
  createdAt: string;
}

export interface Aujourdhui {
  rdvDuJour: Array<{ id: string; reference: string | null; client_nom: string; rdv_heure: string; statut: string }>;
  activiteRecente: ActiviteRecente[];
}

/**
 *   select * from appointments where rdv_date = current_date;
 *
 *   -- union demandes / demande_status_history / payments, 15 dernières
 *   select id, 'demande' as type, nom_complet as label, created_at from demandes
 *   union all
 *   select id, 'statut', step_label, created_at from demande_status_history
 *   union all
 *   select id, 'paiement', reference, created_at from payments
 *   order by created_at desc limit 15;
 */
export async function getAujourdhui(): Promise<Aujourdhui> {
  const supabase = createClient();
  const todayIso = new Date().toISOString().slice(0, 10);

  const [rdvRes, demandesRes, historyRes, paymentsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, reference, client_nom, rdv_heure, statut")
      .eq("rdv_date", todayIso),
    supabase.from("demandes").select("id, nom_complet, created_at").order("created_at", { ascending: false }).limit(15),
    supabase.from("demande_status_history").select("id, step_label, created_at").order("created_at", { ascending: false }).limit(15),
    supabase.from("payments").select("id, reference, created_at").order("created_at", { ascending: false }).limit(15),
  ]);

  const activite: ActiviteRecente[] = [
    ...(demandesRes.data ?? []).map((d) => ({ id: d.id, type: "demande" as const, label: d.nom_complet, createdAt: d.created_at })),
    ...(historyRes.data ?? []).map((h) => ({ id: h.id, type: "statut" as const, label: h.step_label ?? "Étape mise à jour", createdAt: h.created_at })),
    ...(paymentsRes.data ?? []).map((p) => ({ id: p.id, type: "paiement" as const, label: p.reference ?? "Paiement", createdAt: p.created_at })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  return {
    rdvDuJour: rdvRes.data ?? [],
    activiteRecente: activite,
  };
}

/** Vide : « Rien depuis le {date} » — plus honnête qu'un flux vide sans repère. */
export function dernierEvenementLabel(activite: ActiviteRecente[]): string {
  if (activite.length === 0) return "Aucune activité enregistrée pour l'instant.";
  return `Rien depuis le ${new Date(activite[0].createdAt).toLocaleDateString("fr-FR")}`;
}

// ── Bloc 4 : Alertes ─────────────────────────────────────────────────────
export interface Alerte {
  key: string;
  label: string;
  count: number;
}

/**
 * 3 alertes, pas 4 : "documents rejetés sans relance" retirée (voir
 * commentaire en tête de fichier — aucune donnée réelle ne peut la produire).
 *
 *   -- dossiers hors délai
 *   select count(*) from demandes
 *   where deadline < now() and statut not in ('termine','refuse','annule','archive');
 *
 *   -- paiements en attente depuis plus de 3 jours
 *   select count(*) from payments
 *   where status not in ('paid') and created_at < now() - interval '3 days';
 *
 *   -- dossiers sans agent depuis plus de 48h
 *   select count(*) from demandes
 *   where agent_id is null and created_at < now() - interval '48 hours'
 *     and statut not in ('termine','refuse','annule','archive');
 */
export async function getAlertes(): Promise<Alerte[]> {
  const supabase = createClient();
  const now = Date.now();
  const seuilPaiement = now - PAIEMENT_ATTENTE_SEUIL_JOURS * 24 * 60 * 60 * 1000;
  const seuilAgent = now - SANS_AGENT_SEUIL_HEURES * 60 * 60 * 1000;

  const [demandesRes, paymentsRes] = await Promise.all([
    supabase.from("demandes").select("statut, agent_id, deadline, created_at"),
    supabase.from("payments").select("status, created_at"),
  ]);

  const demandes = demandesRes.data ?? [];
  const payments = paymentsRes.data ?? [];

  const dossiersHorsDelai = demandes.filter(
    (d) => d.deadline && new Date(d.deadline).getTime() < now && !TERMINAL_STATUTS.includes(d.statut)
  ).length;

  const paiementsEnAttente = payments.filter(
    (p) => p.status !== "paid" && new Date(p.created_at).getTime() < seuilPaiement
  ).length;

  const dossiersSansAgent = demandes.filter(
    (d) => !d.agent_id && new Date(d.created_at).getTime() < seuilAgent && !TERMINAL_STATUTS.includes(d.statut)
  ).length;

  return [
    { key: "hors-delai", label: "Dossiers hors délai", count: dossiersHorsDelai },
    { key: "paiements-attente", label: `Paiements en attente depuis plus de ${PAIEMENT_ATTENTE_SEUIL_JOURS} jours`, count: paiementsEnAttente },
    { key: "sans-agent", label: `Dossiers sans agent depuis plus de ${SANS_AGENT_SEUIL_HEURES}h`, count: dossiersSansAgent },
  ];
}
