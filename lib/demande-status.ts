// ============================================================================
// LIB — Statuts détaillés par service ET par catégorie (Nexus Connect)
// 7 services historiques × 6 étapes (rétrocompat)
// 9 catégories de dossier × 6 étapes (refonte 032)
// ============================================================================

import type { CategorieDossier } from "./demande-categories";
import { getCategorieFromService } from "./demande-categories";

export type ServiceLabel =
  | "Visa & e-Visa"
  | "Études à l'étranger"
  | "Billet d'avion & Hôtels"
  | "Incubateur & Financement"
  | "Recouvrement de documents"
  | "Transferts d'argent"
  | "Autre service administratif";

export type StepLabel = string;

type Steps6 = [string, string, string, string, string, string];

/**
 * Étapes par SERVICE (legacy — utilisé par la Timeline existante).
 * Conservé pour rétrocompatibilité — la Timeline lit toujours via getServiceSteps.
 */
export const SERVICE_STEPS: Record<string, Steps6> = {
  "Visa & e-Visa": [
    "Dossier reçu",
    "Vérification documents",
    "Documents complémentaires requis",
    "Dépôt à l'ambassade / consulat",
    "En attente décision consulaire",
    "Visa délivré",
  ],
  "Études à l'étranger": [
    "Dossier reçu",
    "Analyse du profil",
    "Documents complémentaires requis",
    "Candidature soumise à l'établissement",
    "En attente d'admission",
    "Admission obtenue",
  ],
  "Billet d'avion & Hôtels": [
    "Dossier reçu",
    "Recherche d'options",
    "Validation client",
    "Réservation en cours",
    "Confirmation fournisseur",
    "Billets / Réservations délivrés",
  ],
  "Incubateur & Financement": [
    "Dossier reçu",
    "Évaluation du projet",
    "Documents complémentaires requis",
    "Présentation au comité",
    "En attente de décision",
    "Accompagnement validé",
  ],
  "Recouvrement de documents": [
    "Dossier reçu",
    "Identification de l'organisme",
    "Pouvoirs / autorisations requis",
    "Demande déposée",
    "En attente de l'organisme",
    "Document récupéré",
  ],
  "Transferts d'argent": [
    "Dossier reçu",
    "Vérification destinataire",
    "Justificatifs requis",
    "Transfert initié",
    "En cours d'acheminement",
    "Transfert reçu",
  ],
  "Autre service administratif": [
    "Dossier reçu",
    "En analyse",
    "Documents requis",
    "En traitement",
    "En attente externe",
    "Finalisé",
  ],
};

/**
 * Étapes par CATÉGORIE de dossier (refonte 032).
 * Source de vérité côté staff (vue par catégorie).
 */
export const CATEGORIE_STEPS: Record<CategorieDossier, Steps6> = {
  visa: [
    "Dossier reçu",
    "Vérification documents",
    "Documents complémentaires requis",
    "Dépôt à l'ambassade / consulat",
    "En attente décision consulaire",
    "Visa délivré",
  ],
  etudes_bourses: [
    "Dossier reçu",
    "Analyse du profil",
    "Documents complémentaires requis",
    "Candidature soumise",
    "En attente d'admission",
    "Admission obtenue",
  ],
  billets_hotels: [
    "Dossier reçu",
    "Recherche d'options",
    "Validation client",
    "Réservation en cours",
    "Confirmation fournisseur",
    "Billets / Réservations délivrés",
  ],
  assurances: [
    "Dossier reçu",
    "Analyse des besoins",
    "Devis transmis",
    "Validation client",
    "Souscription en cours",
    "Police d'assurance émise",
  ],
  financement_incubateur: [
    "Dossier reçu",
    "Évaluation du projet",
    "Documents complémentaires requis",
    "Présentation au comité",
    "En attente de décision",
    "Accompagnement validé",
  ],
  digitalisation: [
    "Dossier reçu",
    "Cadrage du projet",
    "Devis et contrat",
    "Production en cours",
    "Livraison et tests",
    "Projet livré",
  ],
  recouvrement: [
    "Dossier reçu",
    "Identification de l'organisme",
    "Pouvoirs / autorisations requis",
    "Demande déposée",
    "En attente de l'organisme",
    "Document récupéré",
  ],
  transferts: [
    "Dossier reçu",
    "Vérification destinataire",
    "Justificatifs requis",
    "Transfert initié",
    "En cours d'acheminement",
    "Transfert reçu",
  ],
  autres: [
    "Dossier reçu",
    "En analyse",
    "Documents requis",
    "En traitement",
    "En attente externe",
    "Finalisé",
  ],
};

/** Étapes par défaut si le service n'est pas trouvé */
const DEFAULT_STEPS: Steps6 = [
  "Dossier reçu",
  "En analyse",
  "Documents requis",
  "En traitement",
  "En attente",
  "Finalisé",
];

/**
 * Lookup par SERVICE (legacy).
 * Si non trouvé, fallback via mapping service → catégorie.
 */
export function getServiceSteps(service: string | null | undefined): Steps6 {
  if (!service) return DEFAULT_STEPS;
  const direct = SERVICE_STEPS[service];
  if (direct) return direct;
  // Fallback : on déduit la catégorie depuis le service (variantes historiques)
  return CATEGORIE_STEPS[getCategorieFromService(service)];
}

/**
 * Lookup par CATÉGORIE (source de vérité refonte 032).
 */
export function getCategorieSteps(categorie: CategorieDossier | null | undefined): Steps6 {
  if (!categorie) return DEFAULT_STEPS;
  return CATEGORIE_STEPS[categorie];
}

/**
 * Label de l'étape courante — pratique pour les badges/headers.
 * Préfère la catégorie si fournie, sinon retombe sur le service.
 */
export function getCurrentStepLabel(
  service: string | null | undefined,
  currentStep: number | null | undefined,
  categorie?: CategorieDossier | null
): string {
  const steps = categorie ? getCategorieSteps(categorie) : getServiceSteps(service);
  const idx = Math.max(0, Math.min(5, (currentStep || 1) - 1));
  return steps[idx];
}

export function getStepProgress(currentStep: number | null | undefined): number {
  return Math.round(((currentStep || 1) / 6) * 100);
}

export function isCancelled(statut: string | null | undefined): boolean {
  const lower = (statut || "").toLowerCase();
  return lower.includes("annul") || lower.includes("rejet") || lower.includes("refuse");
}

export function isCompleted(
  statut: string | null | undefined,
  currentStep: number | null | undefined
): boolean {
  const lower = (statut || "").toLowerCase();
  if (lower.includes("complet") || lower.includes("termin")) return true;
  if ((currentStep || 0) >= 6) return true;
  return false;
}
