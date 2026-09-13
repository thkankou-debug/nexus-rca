// ============================================================================
// MACHINE À ÉTATS DES DOSSIERS — P3
//
// Règles pures, zéro dépendance Supabase/Next (même principe que lib/rbac.ts).
// Ne décide PAS qui a le droit d'agir (assertPermission côté appelant) ni
// n'écrit rien (demande_status_history/audit_log restent à la charge de la
// route qui appelle canTransition puis effectue l'UPDATE + les écritures).
//
//   nouvelle_demande → qualification
//      ├→ documents_demandes ⇄ dossier_incomplet → etude_faisabilite → devis_envoye
//      │     ├→ devis_accepte → paiement_attente → traitement
//      │     └→ refuse
//      └→ annule
//   traitement → transmis_partenaire → decision_recue → { termine | refuse }
//   {termine | refuse | annule} → archive
// ============================================================================

export type DossierStatus =
  | "nouvelle_demande"
  | "qualification"
  | "documents_demandes"
  | "dossier_incomplet"
  | "etude_faisabilite"
  | "devis_envoye"
  | "devis_accepte"
  | "paiement_attente"
  | "traitement"
  | "transmis_partenaire"
  | "decision_recue"
  | "termine"
  | "refuse"
  | "annule"
  | "archive";

export const TRANSITIONS: Record<DossierStatus, DossierStatus[]> = {
  nouvelle_demande: ["qualification", "annule"],
  qualification: ["documents_demandes", "annule"],
  documents_demandes: ["dossier_incomplet", "etude_faisabilite", "annule"],
  dossier_incomplet: ["documents_demandes", "annule"],
  etude_faisabilite: ["devis_envoye", "annule"],
  devis_envoye: ["devis_accepte", "refuse", "annule"],
  devis_accepte: ["paiement_attente", "annule"],
  paiement_attente: ["traitement", "annule"],
  traitement: ["transmis_partenaire", "annule"],
  transmis_partenaire: ["decision_recue", "annule"],
  decision_recue: ["termine", "refuse"],
  termine: ["archive"],
  refuse: ["archive"],
  annule: ["archive"],
  archive: [],
};

/**
 * Transition normale (avant) : true si `to` est directement atteignable
 * depuis `from` selon le graphe ci-dessus.
 */
export function isForwardTransition(from: DossierStatus, to: DossierStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Un retour arrière (vers un état qui n'est pas dans TRANSITIONS[from]) est
 * réservé à admin/super_admin avec motif obligatoire — vérifié par
 * l'appelant (assertPermission + présence d'un motif non vide), pas ici :
 * cette fonction reste une règle pure, sans notion de rôle.
 */
export function canTransition(
  from: DossierStatus,
  to: DossierStatus,
  options: { isReverseOverride?: boolean; reason?: string } = {}
): boolean {
  if (from === to) return false;
  if (isForwardTransition(from, to)) return true;
  return Boolean(options.isReverseOverride && options.reason?.trim());
}
