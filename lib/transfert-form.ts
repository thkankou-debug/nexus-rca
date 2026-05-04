// ============================================================================
// TRANSFERT FORM — Source unique de vérité
// Types, constantes, validation, règles de qualification, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Sens = "envoi_depuis_rca" | "reception_vers_rca";

export type PaysResidence =
  | "RCA"
  | "Cameroun"
  | "France"
  | "Canada"
  | "Belgique"
  | "Etats_Unis"
  | "Autre";

export type Devise = "FCFA" | "EUR" | "USD" | "CAD" | "GBP" | "Autre";

export type Tranche =
  | "moins_100k"
  | "100k_500k"
  | "500k_2m"
  | "2m_10m"
  | "10m_plus";

export type Motif =
  | "soutien_familial"
  | "frais_etudes"
  | "paiement_fournisseur"
  | "paiement_client"
  | "salaire"
  | "achat_personnel"
  | "investissement"
  | "ong_humanitaire"
  | "autre";

export type Frequence = "ponctuel" | "regulier_mensuel" | "regulier_autre";

export type CanalPrefere =
  | "western_union"
  | "moneygram"
  | "mobile_money"
  | "virement_bancaire"
  | "indifferent";

export type ModeReception =
  | "espece"
  | "mobile_money"
  | "compte_bancaire"
  | "indifferent";

export type Urgence = "immediate" | "24h" | "quelques_jours" | "non_urgent";

export type ProfilPiece = "carte_identite" | "passeport" | "permis_conduire" | "autre";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface TransfertFormData {
  // Étape 1 — Expéditeur
  nom_complet: string;
  email: string;
  telephone: string;
  pays_residence: PaysResidence | "";
  type_piece: ProfilPiece | "";

  // Étape 2 — Opération
  sens: Sens | "";
  motif: Motif | "";
  frequence: Frequence | "";
  urgence: Urgence | "";

  // Étape 3 — Montant & devise
  tranche: Tranche | "";
  devise_emission: Devise | "";
  devise_reception: Devise | "";
  montant_indicatif: string;

  // Étape 4 — Bénéficiaire & canal
  beneficiaire_nom: string;
  beneficiaire_pays: string;
  beneficiaire_ville: string;
  canal_prefere: CanalPrefere | "";
  mode_reception: ModeReception | "";
  precisions: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
  consentement_origine_fonds: boolean;
}

export type ValidationErrors = Partial<
  Record<keyof TransfertFormData, string>
>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_TRANSFERT_FORM: TransfertFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays_residence: "",
  type_piece: "",

  sens: "",
  motif: "",
  frequence: "",
  urgence: "",

  tranche: "",
  devise_emission: "",
  devise_reception: "",
  montant_indicatif: "",

  beneficiaire_nom: "",
  beneficiaire_pays: "",
  beneficiaire_ville: "",
  canal_prefere: "",
  mode_reception: "",
  precisions: "",

  consentement_examen: false,
  consentement_traitement: false,
  consentement_origine_fonds: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const PAYS_RESIDENCE_OPTIONS: { value: PaysResidence; label: string }[] =
  [
    { value: "RCA", label: "République Centrafricaine" },
    { value: "Cameroun", label: "Cameroun" },
    { value: "France", label: "France" },
    { value: "Canada", label: "Canada" },
    { value: "Belgique", label: "Belgique" },
    { value: "Etats_Unis", label: "États-Unis" },
    { value: "Autre", label: "Autre" },
  ];

export const TYPES_PIECE: { value: ProfilPiece; label: string }[] = [
  { value: "carte_identite", label: "Carte d'identité nationale" },
  { value: "passeport", label: "Passeport" },
  { value: "permis_conduire", label: "Permis de conduire" },
  { value: "autre", label: "Autre" },
];

export const SENS_OPTIONS: { value: Sens; label: string }[] = [
  { value: "envoi_depuis_rca", label: "Envoi depuis la RCA vers l'étranger" },
  { value: "reception_vers_rca", label: "Réception vers la RCA depuis l'étranger" },
];

export const MOTIFS: { value: Motif; label: string }[] = [
  { value: "soutien_familial", label: "Soutien familial" },
  { value: "frais_etudes", label: "Frais d'études" },
  { value: "paiement_fournisseur", label: "Paiement fournisseur" },
  { value: "paiement_client", label: "Paiement reçu d'un client" },
  { value: "salaire", label: "Salaire / honoraires" },
  { value: "achat_personnel", label: "Achat personnel" },
  { value: "investissement", label: "Investissement" },
  { value: "ong_humanitaire", label: "ONG / humanitaire" },
  { value: "autre", label: "Autre motif" },
];

export const FREQUENCES: { value: Frequence; label: string }[] = [
  { value: "ponctuel", label: "Transfert ponctuel" },
  { value: "regulier_mensuel", label: "Régulier — chaque mois" },
  { value: "regulier_autre", label: "Régulier — autre rythme" },
];

export const URGENCES: { value: Urgence; label: string }[] = [
  { value: "immediate", label: "Immédiat — dans la journée" },
  { value: "24h", label: "Sous 24 h" },
  { value: "quelques_jours", label: "Quelques jours acceptables" },
  { value: "non_urgent", label: "Non urgent — flexible" },
];

export const TRANCHES: { value: Tranche; label: string }[] = [
  { value: "moins_100k", label: "Moins de 100 000 FCFA (~150 €)" },
  { value: "100k_500k", label: "100 000 à 500 000 FCFA" },
  { value: "500k_2m", label: "500 000 à 2 millions FCFA" },
  { value: "2m_10m", label: "2 à 10 millions FCFA" },
  { value: "10m_plus", label: "Plus de 10 millions FCFA" },
];

export const DEVISES: { value: Devise; label: string }[] = [
  { value: "FCFA", label: "FCFA (XAF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar US (USD)" },
  { value: "CAD", label: "Dollar canadien (CAD)" },
  { value: "GBP", label: "Livre sterling (GBP)" },
  { value: "Autre", label: "Autre devise" },
];

export const CANAUX_PREFERES: { value: CanalPrefere; label: string }[] = [
  { value: "western_union", label: "Western Union" },
  { value: "moneygram", label: "MoneyGram" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "virement_bancaire", label: "Virement bancaire" },
  { value: "indifferent", label: "Indifférent — laissez Nexus conseiller" },
];

export const MODES_RECEPTION: { value: ModeReception; label: string }[] = [
  { value: "espece", label: "Retrait en espèces" },
  { value: "mobile_money", label: "Compte mobile money" },
  { value: "compte_bancaire", label: "Compte bancaire" },
  { value: "indifferent", label: "Indifférent" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function sensLabel(s: Sens | ""): string {
  return SENS_OPTIONS.find((x) => x.value === s)?.label || "—";
}
export function motifLabel(m: Motif | ""): string {
  return MOTIFS.find((x) => x.value === m)?.label || "—";
}
export function frequenceLabel(f: Frequence | ""): string {
  return FREQUENCES.find((x) => x.value === f)?.label || "—";
}
export function urgenceLabel(u: Urgence | ""): string {
  return URGENCES.find((x) => x.value === u)?.label || "—";
}
export function trancheLabel(t: Tranche | ""): string {
  return TRANCHES.find((x) => x.value === t)?.label || "—";
}
export function deviseLabel(d: Devise | ""): string {
  return DEVISES.find((x) => x.value === d)?.label || "—";
}
export function canalLabel(c: CanalPrefere | ""): string {
  return CANAUX_PREFERES.find((x) => x.value === c)?.label || "—";
}
export function modeReceptionLabel(m: ModeReception | ""): string {
  return MODES_RECEPTION.find((x) => x.value === m)?.label || "—";
}
export function typePieceLabel(p: ProfilPiece | ""): string {
  return TYPES_PIECE.find((x) => x.value === p)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: TransfertFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.pays_residence) e.pays_residence = "Pays de résidence requis";
    if (!form.type_piece) e.type_piece = "Type de pièce d'identité requis";
  }

  if (step === 2) {
    if (!form.sens) e.sens = "Sens du transfert requis";
    if (!form.motif) e.motif = "Motif du transfert requis";
    if (!form.frequence) e.frequence = "Fréquence requise";
    if (!form.urgence) e.urgence = "Urgence requise";
  }

  if (step === 3) {
    if (!form.tranche) e.tranche = "Tranche de montant requise";
    if (!form.devise_emission) e.devise_emission = "Devise d'émission requise";
    if (!form.devise_reception)
      e.devise_reception = "Devise de réception requise";
  }

  if (step === 4) {
    if (!form.beneficiaire_nom.trim() || form.beneficiaire_nom.trim().length < 3)
      e.beneficiaire_nom = "Nom du bénéficiaire requis";
    if (!form.beneficiaire_pays.trim())
      e.beneficiaire_pays = "Pays du bénéficiaire requis";
    if (!form.beneficiaire_ville.trim())
      e.beneficiaire_ville = "Ville du bénéficiaire requise";
    if (!form.canal_prefere) e.canal_prefere = "Canal souhaité requis";
    if (!form.mode_reception) e.mode_reception = "Mode de réception requis";
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

export function requiresSeniorAnalysis(form: TransfertFormData): boolean {
  // Gros montant
  if (form.tranche === "10m_plus") return true;
  // Montant élevé + immédiat
  if (form.tranche === "2m_10m" && form.urgence === "immediate") return true;
  // Mobile money pour gros montant (10m_plus déjà bloqué plus haut)
  if (
    form.canal_prefere === "mobile_money" &&
    form.tranche === "2m_10m"
  ) {
    return true;
  }
  // Investissement = analyse cadre réglementaire (10m_plus déjà bloqué)
  if (form.motif === "investissement" && form.tranche === "2m_10m") {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: TransfertFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute : petits / moyens montants, motif standard, urgence normale
  if (
    (form.tranche === "moins_100k" ||
      form.tranche === "100k_500k" ||
      form.tranche === "500k_2m") &&
    (form.motif === "soutien_familial" ||
      form.motif === "frais_etudes" ||
      form.motif === "salaire") &&
    form.urgence !== "immediate"
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
          "Votre demande correspond à une opération courante. Sous réserve de la validation des coordonnées du bénéficiaire, le transfert peut être exécuté rapidement.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre demande est cohérente. Le canal et les justificatifs seront affinés par le conseiller selon les contraintes réglementaires.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Le montant ou la combinaison choisie nécessite une analyse approfondie par un conseiller senior (justificatifs renforcés, fractionnement éventuel). Réponse sous 24 h ouvrées.",
      };
  }
}

// ─── CHECKLIST DOCUMENTS ────────────────────────────────────────────────────

export function generateChecklist(
  tranche: Tranche | "",
  motif: Motif | "",
  sens: Sens | ""
): string[] {
  const base = [
    "Pièce d'identité valide de l'expéditeur",
    "Coordonnées exactes du bénéficiaire (nom complet, ville, téléphone)",
    "Numéro ou IBAN du bénéficiaire si virement bancaire",
  ];

  if (
    tranche === "2m_10m" ||
    tranche === "10m_plus" ||
    motif === "paiement_fournisseur" ||
    motif === "investissement"
  ) {
    base.push("Justificatif d'origine des fonds (relevé, contrat, facture)");
    base.push("Motif détaillé du transfert (justificatif écrit)");
  }

  if (motif === "paiement_fournisseur" || motif === "paiement_client") {
    base.push("Facture ou bon de commande correspondant");
  }

  if (motif === "frais_etudes") {
    base.push("Attestation d'inscription ou facture de l'établissement");
  }

  if (sens === "envoi_depuis_rca" && (tranche === "2m_10m" || tranche === "10m_plus")) {
    base.push("Justificatif de domicile récent en RCA");
  }

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  canal: CanalPrefere | "",
  tranche: Tranche | ""
): string | null {
  if (!canal) return null;

  if (canal === "mobile_money") {
    return "Réception : instantané à 30 minutes après exécution";
  }
  if (canal === "western_union" || canal === "moneygram") {
    return "Réception : quelques minutes à 1 heure après exécution";
  }
  if (canal === "virement_bancaire") {
    if (tranche === "2m_10m" || tranche === "10m_plus") {
      return "Réception : 2 à 5 jours ouvrés (gros montant + contrôles bancaires)";
    }
    return "Réception : 1 à 3 jours ouvrés";
  }
  if (canal === "indifferent") {
    return "Délai annoncé après recommandation du canal optimal par le conseiller";
  }
  return null;
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const TRANSFERT_FORM_STORAGE_KEY = "nexus_transfert_draft_v1";
