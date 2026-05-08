// ============================================================================
// LIB — Statuts détaillés par service (Nexus Connect Client)
// Mapping des 7 services × 6 étapes selon BRIEF_NEXUS_CONNECT_CLIENT.md
// ============================================================================

export type ServiceLabel =
  | "Visa & e-Visa"
  | "Études à l'étranger"
  | "Billet d'avion & Hôtels"
  | "Incubateur & Financement"
  | "Recouvrement de documents"
  | "Transferts d'argent"
  | "Autre service administratif";

export type StepLabel = string;

/**
 * 6 étapes par service. La dernière étape peut avoir une variante "refusé"
 * gérée séparément via le statut `annule`.
 */
export const SERVICE_STEPS: Record<string, [string, string, string, string, string, string]> = {
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

/** Étapes par défaut si le service n'est pas trouvé */
const DEFAULT_STEPS: [string, string, string, string, string, string] = [
  "Dossier reçu",
  "En analyse",
  "Documents requis",
  "En traitement",
  "En attente",
  "Finalisé",
];

export function getServiceSteps(
  service: string | null | undefined
): [string, string, string, string, string, string] {
  if (!service) return DEFAULT_STEPS;
  return SERVICE_STEPS[service] || DEFAULT_STEPS;
}

export function getCurrentStepLabel(
  service: string | null | undefined,
  currentStep: number | null | undefined
): string {
  const steps = getServiceSteps(service);
  const idx = Math.max(0, Math.min(5, (currentStep || 1) - 1));
  return steps[idx];
}

export function getStepProgress(currentStep: number | null | undefined): number {
  return Math.round(((currentStep || 1) / 6) * 100);
}

/**
 * Une demande est "refusée / annulée" si le statut enum global vaut
 * `annule`. Dans ce cas, on affiche un état rouge à la dernière étape.
 */
export function isCancelled(statut: string | null | undefined): boolean {
  const lower = (statut || "").toLowerCase();
  return lower.includes("annul") || lower.includes("rejet") || lower.includes("refuse");
}

/**
 * Une demande est terminée si statut = `complete` OU current_step = 6.
 */
export function isCompleted(
  statut: string | null | undefined,
  currentStep: number | null | undefined
): boolean {
  const lower = (statut || "").toLowerCase();
  if (lower.includes("complet") || lower.includes("termin")) return true;
  if ((currentStep || 0) >= 6) return true;
  return false;
}
