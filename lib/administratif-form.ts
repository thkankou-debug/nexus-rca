// ============================================================================
// ADMINISTRATIF FORM — Source unique de vérité
// Types, constantes, validation, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Prestation =
  | "cv"
  | "lettre_motivation"
  | "cv_et_lettre"
  | "traduction"
  | "formulaire_officiel"
  | "impression_scan"
  | "redaction_diverse"
  | "autre";

export type FormatCv =
  | "canadien"
  | "francais"
  | "international"
  | "africain"
  | "non_defini";

export type ObjectifLettre =
  | "etudes"
  | "emploi"
  | "visa"
  | "bourse"
  | "stage"
  | "autre";

export type LangueSource = "francais" | "anglais" | "autre";
export type LangueCible = "francais" | "anglais" | "autre";

export type TypeFormulaire =
  | "ircc_canada"
  | "france_visas"
  | "consulat"
  | "universite"
  | "ofii"
  | "ohada_juridique"
  | "autre";

export type Urgence =
  | "moins_24h"
  | "24_48h"
  | "2_5_jours"
  | "plus_5_jours";

export type Livraison = "numerique" | "imprime_agence" | "les_deux";

export type ImpressionType =
  | "ponctuelle"
  | "dossier_complet"
  | "reliure_plastification"
  | "scan_numerisation";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface AdministratifFormData {
  // Étape 1 — Demandeur
  nom_complet: string;
  email: string;
  telephone: string;

  // Étape 2 — Prestation
  prestation: Prestation | "";
  urgence: Urgence | "";
  precisions_besoin: string;

  // Étape 3 — Détails (variables selon prestation)
  format_cv: FormatCv | "";
  objectif_lettre: ObjectifLettre | "";
  langue_source: LangueSource | "";
  langue_cible: LangueCible | "";
  pages_traduction: string;
  type_formulaire: TypeFormulaire | "";
  type_impression: ImpressionType | "";

  // Étape 4 — Documents & livraison
  documents_fournis: string[];
  livraison: Livraison | "";
  precisions_livraison: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
  consentement_confidentialite: boolean;
}

export type ValidationErrors = Partial<
  Record<keyof AdministratifFormData, string>
>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_ADMINISTRATIF_FORM: AdministratifFormData = {
  nom_complet: "",
  email: "",
  telephone: "",

  prestation: "",
  urgence: "",
  precisions_besoin: "",

  format_cv: "",
  objectif_lettre: "",
  langue_source: "",
  langue_cible: "",
  pages_traduction: "",
  type_formulaire: "",
  type_impression: "",

  documents_fournis: [],
  livraison: "",
  precisions_livraison: "",

  consentement_examen: false,
  consentement_traitement: false,
  consentement_confidentialite: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const PRESTATIONS: { value: Prestation; label: string }[] = [
  { value: "cv", label: "CV (rédaction ou refonte)" },
  { value: "lettre_motivation", label: "Lettre de motivation" },
  { value: "cv_et_lettre", label: "CV + lettre de motivation (combo)" },
  { value: "traduction", label: "Traduction" },
  { value: "formulaire_officiel", label: "Remplissage formulaire officiel" },
  { value: "impression_scan", label: "Impression / scan / reliure" },
  { value: "redaction_diverse", label: "Rédaction diverse (courrier, attestation…)" },
  { value: "autre", label: "Autre besoin" },
];

export const FORMATS_CV: { value: FormatCv; label: string }[] = [
  { value: "canadien", label: "Canadien (IRCC, employeurs Canada)" },
  { value: "francais", label: "Français / européen" },
  { value: "international", label: "International (anglophone générique)" },
  { value: "africain", label: "Africain / régional" },
  { value: "non_defini", label: "Non défini — laissez-moi conseiller" },
];

export const OBJECTIFS_LETTRE: { value: ObjectifLettre; label: string }[] = [
  { value: "etudes", label: "Admission études" },
  { value: "emploi", label: "Candidature emploi" },
  { value: "visa", label: "Lettre pour visa" },
  { value: "bourse", label: "Demande de bourse" },
  { value: "stage", label: "Stage / immersion" },
  { value: "autre", label: "Autre objectif" },
];

export const LANGUES_OPTIONS: { value: string; label: string }[] = [
  { value: "francais", label: "Français" },
  { value: "anglais", label: "Anglais" },
  { value: "autre", label: "Autre langue" },
];

export const TYPES_FORMULAIRE: { value: TypeFormulaire; label: string }[] = [
  { value: "ircc_canada", label: "IRCC (Canada — visa, permis d'études, RP)" },
  { value: "france_visas", label: "France-Visas / TLScontact" },
  { value: "consulat", label: "Autre formulaire consulaire" },
  { value: "universite", label: "Dossier universitaire" },
  { value: "ofii", label: "OFII / titre de séjour" },
  { value: "ohada_juridique", label: "Document juridique OHADA / commercial" },
  { value: "autre", label: "Autre formulaire officiel" },
];

export const TYPES_IMPRESSION: { value: ImpressionType; label: string }[] = [
  { value: "ponctuelle", label: "Impression ponctuelle (quelques pages)" },
  { value: "dossier_complet", label: "Dossier complet (rapport, mémoire…)" },
  { value: "reliure_plastification", label: "Reliure / plastification" },
  { value: "scan_numerisation", label: "Scan / numérisation haute qualité" },
];

export const URGENCES: { value: Urgence; label: string }[] = [
  { value: "moins_24h", label: "Moins de 24 heures" },
  { value: "24_48h", label: "24 à 48 heures" },
  { value: "2_5_jours", label: "2 à 5 jours" },
  { value: "plus_5_jours", label: "Plus de 5 jours" },
];

export const LIVRAISONS: { value: Livraison; label: string }[] = [
  { value: "numerique", label: "Numérique uniquement (PDF + modifiable)" },
  { value: "imprime_agence", label: "Imprimé à l'agence Bangui" },
  { value: "les_deux", label: "Les deux (numérique + impression)" },
];

export const DOCUMENTS_FOURNIS_OPTIONS: { value: string; label: string }[] = [
  { value: "cv_actuel", label: "CV actuel (à refondre)" },
  { value: "diplomes", label: "Diplômes / relevés de notes" },
  { value: "contrats", label: "Contrats / attestations professionnelles" },
  { value: "lettres_existantes", label: "Lettres ou courriers existants" },
  { value: "formulaire_vierge", label: "Formulaire vierge à remplir" },
  { value: "liste_pieces", label: "Liste des pièces demandées par le destinataire" },
  { value: "doc_a_traduire", label: "Document(s) à traduire" },
  { value: "aucun_pour_l_instant", label: "Aucun pour l'instant" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function prestationLabel(p: Prestation | ""): string {
  return PRESTATIONS.find((x) => x.value === p)?.label || "—";
}
export function formatCvLabel(f: FormatCv | ""): string {
  return FORMATS_CV.find((x) => x.value === f)?.label || "—";
}
export function objectifLettreLabel(o: ObjectifLettre | ""): string {
  return OBJECTIFS_LETTRE.find((x) => x.value === o)?.label || "—";
}
export function langueLabel(l: string): string {
  return LANGUES_OPTIONS.find((x) => x.value === l)?.label || "—";
}
export function typeFormulaireLabel(t: TypeFormulaire | ""): string {
  return TYPES_FORMULAIRE.find((x) => x.value === t)?.label || "—";
}
export function typeImpressionLabel(t: ImpressionType | ""): string {
  return TYPES_IMPRESSION.find((x) => x.value === t)?.label || "—";
}
export function urgenceLabel(u: Urgence | ""): string {
  return URGENCES.find((x) => x.value === u)?.label || "—";
}
export function livraisonLabel(l: Livraison | ""): string {
  return LIVRAISONS.find((x) => x.value === l)?.label || "—";
}

// ─── HELPERS DE BRANCHEMENT ─────────────────────────────────────────────────

export function needsCv(p: Prestation | ""): boolean {
  return p === "cv" || p === "cv_et_lettre";
}
export function needsLetter(p: Prestation | ""): boolean {
  return p === "lettre_motivation" || p === "cv_et_lettre";
}
export function needsTranslation(p: Prestation | ""): boolean {
  return p === "traduction";
}
export function needsForm(p: Prestation | ""): boolean {
  return p === "formulaire_officiel";
}
export function needsPrint(p: Prestation | ""): boolean {
  return p === "impression_scan";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: AdministratifFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
  }

  if (step === 2) {
    if (!form.prestation) e.prestation = "Type de prestation requis";
    if (!form.urgence) e.urgence = "Urgence requise";
  }

  if (step === 3) {
    if (needsCv(form.prestation)) {
      if (!form.format_cv) e.format_cv = "Format de CV requis";
    }
    if (needsLetter(form.prestation)) {
      if (!form.objectif_lettre)
        e.objectif_lettre = "Objectif de la lettre requis";
    }
    if (needsTranslation(form.prestation)) {
      if (!form.langue_source) e.langue_source = "Langue source requise";
      if (!form.langue_cible) e.langue_cible = "Langue cible requise";
      if (
        form.langue_source &&
        form.langue_cible &&
        form.langue_source === form.langue_cible
      ) {
        e.langue_cible = "Source et cible doivent être différentes";
      }
    }
    if (needsForm(form.prestation)) {
      if (!form.type_formulaire)
        e.type_formulaire = "Type de formulaire requis";
    }
    if (needsPrint(form.prestation)) {
      if (!form.type_impression)
        e.type_impression = "Type d'impression requis";
    }
  }

  if (step === 4) {
    if (!form.livraison) e.livraison = "Mode de livraison requis";
  }

  if (step === 5) {
    if (!form.consentement_examen)
      e.consentement_examen = "Consentement requis";
    if (!form.consentement_traitement)
      e.consentement_traitement = "Consentement requis";
    if (!form.consentement_confidentialite)
      e.consentement_confidentialite = "Consentement requis";
  }

  return e;
}

// ─── QUALIFICATION & FAISABILITÉ ────────────────────────────────────────────

export function requiresSeniorAnalysis(form: AdministratifFormData): boolean {
  // Délai très court + prestation lourde
  if (
    form.urgence === "moins_24h" &&
    (form.prestation === "formulaire_officiel" ||
      form.prestation === "cv_et_lettre" ||
      (form.prestation === "traduction" &&
        form.pages_traduction &&
        Number.parseInt(form.pages_traduction) > 5))
  ) {
    return true;
  }
  // OHADA / juridique = relecture spécialisée
  if (form.type_formulaire === "ohada_juridique") return true;
  return false;
}

export function computeFaisabilite(
  form: AdministratifFormData
): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  if (
    (form.urgence === "2_5_jours" || form.urgence === "plus_5_jours") &&
    form.prestation !== "formulaire_officiel"
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
          "Votre demande est dans un cadre standard avec un délai confortable. Devis sous quelques heures, livraison dans le délai annoncé.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre demande est cohérente. Le délai et le périmètre seront affinés par le conseiller dans le devis.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Délai très court ou prestation spécialisée (juridique, gros volume). Un conseiller senior valide la faisabilité avant tout engagement de délai.",
      };
  }
}

// ─── CHECKLIST ──────────────────────────────────────────────────────────────

export function generateChecklist(form: AdministratifFormData): string[] {
  const base: string[] = [];

  if (needsCv(form.prestation)) {
    base.push("CV existant si vous en avez un");
    base.push("Diplômes et relevés de notes");
    base.push("Liste détaillée de vos expériences (dates, employeurs, missions)");
  }

  if (needsLetter(form.prestation)) {
    base.push("Annonce ou descriptif du programme/poste/visa visé");
    base.push("Vos motivations principales en quelques lignes");
  }

  if (needsTranslation(form.prestation)) {
    base.push("Document(s) à traduire en bonne qualité (PDF ou photo nette)");
    base.push("Précision si traduction assermentée requise");
  }

  if (needsForm(form.prestation)) {
    base.push("Liste des pièces demandées par le destinataire");
    base.push("Toutes vos informations personnelles à jour");
    base.push("Formulaire vierge ou lien vers le portail officiel");
  }

  if (needsPrint(form.prestation)) {
    base.push("Document à imprimer / scanner en format numérique");
  }

  base.push("Vous resterez signataire du document final si signature requise");

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  prestation: Prestation | "",
  urgence: Urgence | ""
): string | null {
  if (!prestation) return null;

  if (urgence === "moins_24h") {
    return "Express : sous 24 h ouvrées si périmètre validé";
  }

  switch (prestation) {
    case "cv":
    case "lettre_motivation":
    case "cv_et_lettre":
      return "Livraison : 24 à 48 h ouvrées après cadrage";
    case "traduction":
      return "Livraison : 24 à 72 h selon volume et langue";
    case "formulaire_officiel":
      return "Livraison : 48 h à 5 jours selon complexité du dossier";
    case "impression_scan":
      return "Livraison : dans la journée à l'agence";
    case "redaction_diverse":
      return "Livraison : 24 à 72 h selon longueur";
    default:
      return "Livraison : à confirmer dans le devis";
  }
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const ADMINISTRATIF_FORM_STORAGE_KEY = "nexus_administratif_draft_v1";
