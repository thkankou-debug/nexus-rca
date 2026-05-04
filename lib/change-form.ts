// ============================================================================
// CHANGE FORM — Source unique de vérité
// Types, constantes, validation, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Devise = "FCFA" | "EUR" | "USD" | "CAD" | "GBP" | "Autre";

export type Sens =
  | "fcfa_vers_devise"
  | "devise_vers_fcfa"
  | "devise_vers_devise";

export type Tranche =
  | "moins_500k"
  | "500k_2m"
  | "2m_5m"
  | "5m_10m"
  | "10m_plus";

export type Motif =
  | "voyage"
  | "etudes"
  | "achat_personnel"
  | "fournisseur"
  | "soutien_familial"
  | "investissement"
  | "autre";

export type Quand =
  | "aujourd_hui"
  | "cette_semaine"
  | "dans_le_mois"
  | "flexible";

export type ProfilPiece =
  | "carte_identite"
  | "passeport"
  | "permis_conduire"
  | "aucune_pour_l_instant";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface ChangeFormData {
  // Étape 1 — Identité
  nom_complet: string;
  email: string;
  telephone: string;
  type_piece: ProfilPiece | "";

  // Étape 2 — Opération
  sens: Sens | "";
  devise_depart: Devise | "";
  devise_arrivee: Devise | "";
  motif: Motif | "";

  // Étape 3 — Montant & timing
  tranche: Tranche | "";
  montant_indicatif: string;
  quand: Quand | "";
  rdv_souhaite: boolean;

  // Étape 4 — Précisions
  precisions: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
  consentement_origine_fonds: boolean;
}

export type ValidationErrors = Partial<Record<keyof ChangeFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_CHANGE_FORM: ChangeFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  type_piece: "",

  sens: "",
  devise_depart: "",
  devise_arrivee: "",
  motif: "",

  tranche: "",
  montant_indicatif: "",
  quand: "",
  rdv_souhaite: false,

  precisions: "",

  consentement_examen: false,
  consentement_traitement: false,
  consentement_origine_fonds: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const TYPES_PIECE: { value: ProfilPiece; label: string }[] = [
  { value: "carte_identite", label: "Carte d'identité nationale" },
  { value: "passeport", label: "Passeport" },
  { value: "permis_conduire", label: "Permis de conduire" },
  { value: "aucune_pour_l_instant", label: "Aucune pour l'instant" },
];

export const DEVISES: { value: Devise; label: string }[] = [
  { value: "FCFA", label: "FCFA (XAF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar US (USD)" },
  { value: "CAD", label: "Dollar canadien (CAD)" },
  { value: "GBP", label: "Livre sterling (GBP)" },
  { value: "Autre", label: "Autre devise" },
];

export const SENS_OPTIONS: { value: Sens; label: string }[] = [
  { value: "fcfa_vers_devise", label: "FCFA → devise étrangère" },
  { value: "devise_vers_fcfa", label: "Devise étrangère → FCFA" },
  { value: "devise_vers_devise", label: "Devise → autre devise" },
];

export const MOTIFS: { value: Motif; label: string }[] = [
  { value: "voyage", label: "Voyage à l'étranger" },
  { value: "etudes", label: "Frais d'études" },
  { value: "achat_personnel", label: "Achat personnel" },
  { value: "fournisseur", label: "Paiement fournisseur" },
  { value: "soutien_familial", label: "Soutien familial" },
  { value: "investissement", label: "Investissement" },
  { value: "autre", label: "Autre motif" },
];

export const TRANCHES: { value: Tranche; label: string }[] = [
  { value: "moins_500k", label: "Moins de 500 000 FCFA (~750 €)" },
  { value: "500k_2m", label: "500 000 à 2 millions FCFA" },
  { value: "2m_5m", label: "2 à 5 millions FCFA" },
  { value: "5m_10m", label: "5 à 10 millions FCFA" },
  { value: "10m_plus", label: "Plus de 10 millions FCFA" },
];

export const QUAND_OPTIONS: { value: Quand; label: string }[] = [
  { value: "aujourd_hui", label: "Aujourd'hui" },
  { value: "cette_semaine", label: "Dans la semaine" },
  { value: "dans_le_mois", label: "Dans le mois" },
  { value: "flexible", label: "Flexible — je suis libre" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function deviseLabel(d: Devise | ""): string {
  return DEVISES.find((x) => x.value === d)?.label || "—";
}
export function sensLabel(s: Sens | ""): string {
  return SENS_OPTIONS.find((x) => x.value === s)?.label || "—";
}
export function motifLabel(m: Motif | ""): string {
  return MOTIFS.find((x) => x.value === m)?.label || "—";
}
export function trancheLabel(t: Tranche | ""): string {
  return TRANCHES.find((x) => x.value === t)?.label || "—";
}
export function quandLabel(q: Quand | ""): string {
  return QUAND_OPTIONS.find((x) => x.value === q)?.label || "—";
}
export function typePieceLabel(p: ProfilPiece | ""): string {
  return TYPES_PIECE.find((x) => x.value === p)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: ChangeFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.type_piece) e.type_piece = "Type de pièce requis";
  }

  if (step === 2) {
    if (!form.sens) e.sens = "Sens du change requis";
    if (!form.devise_depart) e.devise_depart = "Devise de départ requise";
    if (!form.devise_arrivee) e.devise_arrivee = "Devise d'arrivée requise";
    if (form.devise_depart && form.devise_arrivee && form.devise_depart === form.devise_arrivee) {
      e.devise_arrivee = "La devise d'arrivée doit être différente";
    }
    if (!form.motif) e.motif = "Motif requis";
  }

  if (step === 3) {
    if (!form.tranche) e.tranche = "Tranche de montant requise";
    if (!form.quand) e.quand = "Timing souhaité requis";
  }

  if (step === 5) {
    if (!form.consentement_examen)
      e.consentement_examen = "Consentement requis";
    if (!form.consentement_traitement)
      e.consentement_traitement = "Consentement requis";
    if (!form.consentement_origine_fonds)
      e.consentement_origine_fonds = "Consentement requis";
  }

  return e;
}

// ─── QUALIFICATION & FAISABILITÉ ────────────────────────────────────────────

export function requiresSeniorAnalysis(form: ChangeFormData): boolean {
  // Très gros montant
  if (form.tranche === "10m_plus") return true;
  // Investissement + montant élevé
  if (
    form.motif === "investissement" &&
    (form.tranche === "5m_10m" || form.tranche === "2m_5m")
  ) {
    return true;
  }
  // Pas de pièce + gros montant
  if (
    form.type_piece === "aucune_pour_l_instant" &&
    (form.tranche === "5m_10m" || form.tranche === "2m_5m")
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: ChangeFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute : petit/moyen, motif standard, pièce ok
  if (
    (form.tranche === "moins_500k" ||
      form.tranche === "500k_2m" ||
      form.tranche === "2m_5m") &&
    (form.motif === "voyage" ||
      form.motif === "etudes" ||
      form.motif === "soutien_familial") &&
    form.type_piece !== "aucune_pour_l_instant"
  ) {
    return "haute";
  }

  return "moyenne";
}

export function faisabiliteLabel(f: Faisabilite): {
  label: string;
  color: string;
  emoji: string;
  description: string;
} {
  switch (f) {
    case "haute":
      return {
        label: "Faisabilité haute",
        color: "emerald",
        emoji: "🟢",
        description:
          "Votre demande correspond à une opération de change courante. Devis communiqué rapidement avec le taux du jour.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre demande est cohérente. Le conseiller validera la disponibilité du cash et le taux applicable selon le timing.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Le montant ou le contexte nécessite une analyse approfondie (préparation du cash, justificatifs renforcés). Réponse sous 24 h ouvrées.",
      };
  }
}

// ─── CHECKLIST DOCUMENTS ────────────────────────────────────────────────────

export function generateChecklist(
  tranche: Tranche | "",
  motif: Motif | ""
): string[] {
  const base = ["Pièce d'identité valide (carte, passeport ou permis)"];

  if (
    tranche === "2m_5m" ||
    tranche === "5m_10m" ||
    tranche === "10m_plus"
  ) {
    base.push("Justificatif d'origine des fonds");
  }

  if (motif === "etudes") {
    base.push("Attestation d'inscription ou facture (si demandée)");
  }
  if (motif === "fournisseur") {
    base.push("Facture ou bon de commande (si demandé)");
  }
  if (motif === "voyage") {
    base.push("Billet d'avion ou justificatif de voyage (utile pour les douanes)");
  }

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  tranche: Tranche | "",
  quand: Quand | ""
): string | null {
  if (!tranche) return null;

  if (tranche === "moins_500k" || tranche === "500k_2m") {
    return "Devis sous 30 minutes ouvrées · Transaction sur place : 10 à 15 minutes";
  }
  if (tranche === "2m_5m" || tranche === "5m_10m") {
    return "Devis sous 1 heure · Rendez-vous conseillé pour préparer le cash";
  }
  if (tranche === "10m_plus") {
    return "Étude préalable obligatoire · Rendez-vous + préparation cash : 24 à 48 h";
  }
  if (quand === "aujourd_hui" && tranche === "5m_10m") {
    return "Disponibilité immédiate à confirmer avec le conseiller";
  }
  return "Devis sous 1 heure ouvrée";
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const CHANGE_FORM_STORAGE_KEY = "nexus_change_draft_v1";
