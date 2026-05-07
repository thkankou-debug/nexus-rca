/**
 * Types partagés pour le module assurance (devis courtage).
 */

export type CoverageType =
  | "schengen"
  | "voyage_intl"
  | "sante_intl"
  | "etudes"
  | "business";

export const COVERAGE_LABELS: Record<CoverageType, string> = {
  schengen: "Schengen obligatoire",
  voyage_intl: "Voyage international",
  sante_intl: "Santé internationale",
  etudes: "Études à l'étranger",
  business: "Business / déplacements pro",
};

export const COVERAGE_DESCRIPTIONS: Record<CoverageType, string> = {
  schengen:
    "Couverture conforme au standard consulaire UE (30 000 € minimum, espace Schengen, durée du séjour)",
  voyage_intl:
    "Couverture voyage hors espace Schengen — médical, rapatriement, bagages, annulation",
  sante_intl:
    "Couverture santé internationale longue durée — hospitalisation, soins courants, médecine de prévention",
  etudes:
    "Couverture étudiant pour études à l'étranger — santé + RC scolaire + assistance",
  business:
    "Couverture renforcée pour dirigeants et missions répétées — plafonds élevés + conciergerie 24/7",
};

export type Urgency = "normal" | "urgent" | "tres_urgent";

export const URGENCY_LABELS: Record<Urgency, string> = {
  normal: "Normal — délai standard 24 à 48 h",
  urgent: "Urgent — réponse sous 24 h ouvrées",
  tres_urgent: "Très urgent — traitement prioritaire immédiat",
};

export type QuoteStatus =
  | "recu"
  | "analyse"
  | "validation_agent"
  | "devis_pret"
  | "envoye"
  | "archive";

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  recu: "Devis reçu",
  analyse: "Analyse en cours",
  validation_agent: "Validation agent",
  devis_pret: "Devis prêt",
  envoye: "Devis envoyé",
  archive: "Archivé",
};

/** Statuts publiquement visibles (workflow client) — les 4 demandés. */
export const PUBLIC_STATUSES: QuoteStatus[] = [
  "recu",
  "analyse",
  "validation_agent",
  "devis_pret",
];

/**
 * Données de formulaire (front).
 */
export type QuoteFormData = {
  // Étape 1 — Identité
  full_name: string;
  email: string;
  whatsapp: string;
  country_residence: string;

  // Étape 2 — Voyage
  destination: string;
  date_depart: string; // YYYY-MM-DD
  date_retour: string;

  // Étape 3 — Voyageurs & couverture
  num_travelers: number;
  traveler_ages: number[]; // un âge par voyageur
  coverage_types: CoverageType[];
  visa_certificate_required: boolean;

  // Étape 4 — Détails
  urgency: Urgency;
  comments: string;
  acceptation: boolean;
};

/**
 * Estimation tarifaire calculée par lib/insurance/pricing.ts
 */
export type Estimate = {
  min: number;
  max: number;
  currency: "EUR";
  breakdown: string[];
};

/**
 * Devis tel que stocké en base + retourné par l'API.
 */
export type InsuranceQuote = {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  whatsapp: string;
  country_residence: string | null;
  destination: string;
  date_depart: string | null;
  date_retour: string | null;
  duration_days: number | null;
  num_travelers: number;
  traveler_ages: number[];
  coverage_types: CoverageType[];
  visa_certificate_required: boolean;
  urgency: Urgency;
  comments: string | null;
  estimate_min: number | null;
  estimate_max: number | null;
  estimate_currency: string;
  status: QuoteStatus;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
};

export const FORM_INITIAL: QuoteFormData = {
  full_name: "",
  email: "",
  whatsapp: "",
  country_residence: "",
  destination: "",
  date_depart: "",
  date_retour: "",
  num_travelers: 1,
  traveler_ages: [30],
  coverage_types: [],
  visa_certificate_required: false,
  urgency: "normal",
  comments: "",
  acceptation: false,
};
