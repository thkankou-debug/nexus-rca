// ============================================================================
// DIGITALISATION FORM — Source unique de vérité
// Types, constantes, validation, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Pack = "essentiel" | "pro" | "premium" | "non_defini";

export type TypeStructure =
  | "commerce_boutique"
  | "service_professionnel"
  | "restaurant_hotellerie"
  | "association_ong"
  | "education_formation"
  | "sante"
  | "btp_artisanat"
  | "agriculture"
  | "tech_numerique"
  | "autre";

export type Anciennete =
  | "moins_1_an"
  | "1_3_ans"
  | "3_10_ans"
  | "plus_10_ans";

export type PresenceActuelle =
  | "aucune"
  | "facebook_seul"
  | "reseaux_sociaux"
  | "site_obsolete"
  | "site_recent"
  | "whatsapp_business";

export type Audience =
  | "particuliers_locaux"
  | "entreprises_locales"
  | "diaspora"
  | "international"
  | "mixte";

export type ContenusDispos =
  | "tout_pret"
  | "partiel"
  | "presque_rien"
  | "rien";

export type Calendrier =
  | "moins_1_mois"
  | "1_2_mois"
  | "2_3_mois"
  | "plus_3_mois"
  | "ouvert";

export type FonctionnaliteCle =
  | "vitrine_simple"
  | "catalogue_produits"
  | "prise_rdv"
  | "formulaires"
  | "espace_membre"
  | "paiement_en_ligne"
  | "blog"
  | "multilingue";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface DigitalisationFormData {
  // Étape 1 — Demandeur
  nom_complet: string;
  email: string;
  telephone: string;

  // Étape 2 — Activité
  nom_structure: string;
  type_structure: TypeStructure | "";
  anciennete: Anciennete | "";
  description_activite: string;

  // Étape 3 — Pack & objectifs
  pack: Pack | "";
  presence_actuelle: PresenceActuelle | "";
  audience: Audience | "";
  fonctionnalites: string[]; // FonctionnaliteCle[] mais string pour Set facile

  // Étape 4 — Contenus & calendrier
  contenus_dispos: ContenusDispos | "";
  calendrier: Calendrier | "";
  budget_indicatif: string;
  precisions: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<
  Record<keyof DigitalisationFormData, string>
>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_DIGITALISATION_FORM: DigitalisationFormData = {
  nom_complet: "",
  email: "",
  telephone: "",

  nom_structure: "",
  type_structure: "",
  anciennete: "",
  description_activite: "",

  pack: "",
  presence_actuelle: "",
  audience: "",
  fonctionnalites: [],

  contenus_dispos: "",
  calendrier: "",
  budget_indicatif: "",
  precisions: "",

  consentement_examen: false,
  consentement_traitement: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const PACKS_OPTIONS: { value: Pack; label: string }[] = [
  { value: "essentiel", label: "Essentiel — 150 000 à 250 000 FCFA" },
  { value: "pro", label: "Pro — 300 000 à 600 000 FCFA (recommandé)" },
  { value: "premium", label: "Premium — 700 000 à 1 500 000 FCFA+" },
  { value: "non_defini", label: "Pas encore défini — laissez-moi conseiller" },
];

export const TYPES_STRUCTURE: { value: TypeStructure; label: string }[] = [
  { value: "commerce_boutique", label: "Commerce / boutique" },
  { value: "service_professionnel", label: "Service professionnel (B2B/B2C)" },
  { value: "restaurant_hotellerie", label: "Restauration / hôtellerie" },
  { value: "association_ong", label: "Association / ONG" },
  { value: "education_formation", label: "Éducation / formation" },
  { value: "sante", label: "Santé" },
  { value: "btp_artisanat", label: "BTP / artisanat" },
  { value: "agriculture", label: "Agriculture / agro" },
  { value: "tech_numerique", label: "Tech / numérique" },
  { value: "autre", label: "Autre activité" },
];

export const ANCIENNETES: { value: Anciennete; label: string }[] = [
  { value: "moins_1_an", label: "Moins d'un an" },
  { value: "1_3_ans", label: "1 à 3 ans" },
  { value: "3_10_ans", label: "3 à 10 ans" },
  { value: "plus_10_ans", label: "Plus de 10 ans" },
];

export const PRESENCES_ACTUELLES: {
  value: PresenceActuelle;
  label: string;
}[] = [
  { value: "aucune", label: "Aucune présence digitale" },
  { value: "facebook_seul", label: "Facebook uniquement" },
  { value: "reseaux_sociaux", label: "Plusieurs réseaux sociaux actifs" },
  { value: "whatsapp_business", label: "WhatsApp Business utilisé" },
  { value: "site_obsolete", label: "Site web existant mais obsolète" },
  { value: "site_recent", label: "Site web récent à compléter" },
];

export const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "particuliers_locaux", label: "Particuliers à Bangui / RCA" },
  { value: "entreprises_locales", label: "Entreprises locales" },
  { value: "diaspora", label: "Diaspora centrafricaine" },
  { value: "international", label: "Clients internationaux" },
  { value: "mixte", label: "Mixte — local + international" },
];

export const CONTENUS_OPTIONS: { value: ContenusDispos; label: string }[] = [
  {
    value: "tout_pret",
    label: "Tout prêt — textes, photos, logo en main",
  },
  { value: "partiel", label: "Partiellement prêt — éléments à compléter" },
  { value: "presque_rien", label: "Presque rien — j'aurai besoin d'aide" },
  { value: "rien", label: "Rien du tout — partir de zéro" },
];

export const CALENDRIERS: { value: Calendrier; label: string }[] = [
  { value: "moins_1_mois", label: "Moins d'un mois (urgent)" },
  { value: "1_2_mois", label: "1 à 2 mois" },
  { value: "2_3_mois", label: "2 à 3 mois" },
  { value: "plus_3_mois", label: "Plus de 3 mois" },
  { value: "ouvert", label: "Ouvert — qualité avant délai" },
];

export const FONCTIONNALITES_OPTIONS: {
  value: FonctionnaliteCle;
  label: string;
}[] = [
  { value: "vitrine_simple", label: "Site vitrine simple (qui sommes-nous, services, contact)" },
  { value: "catalogue_produits", label: "Catalogue produits / e-commerce" },
  { value: "prise_rdv", label: "Prise de rendez-vous en ligne" },
  { value: "formulaires", label: "Formulaires de demande clients" },
  { value: "espace_membre", label: "Espace membre / connexion" },
  { value: "paiement_en_ligne", label: "Paiement en ligne" },
  { value: "blog", label: "Blog / actualités" },
  { value: "multilingue", label: "Multilingue (FR + EN)" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function packLabel(p: Pack | ""): string {
  return PACKS_OPTIONS.find((x) => x.value === p)?.label || "—";
}
export function typeStructureLabel(t: TypeStructure | ""): string {
  return TYPES_STRUCTURE.find((x) => x.value === t)?.label || "—";
}
export function ancienneteLabel(a: Anciennete | ""): string {
  return ANCIENNETES.find((x) => x.value === a)?.label || "—";
}
export function presenceActuelleLabel(p: PresenceActuelle | ""): string {
  return PRESENCES_ACTUELLES.find((x) => x.value === p)?.label || "—";
}
export function audienceLabel(a: Audience | ""): string {
  return AUDIENCES.find((x) => x.value === a)?.label || "—";
}
export function contenusLabel(c: ContenusDispos | ""): string {
  return CONTENUS_OPTIONS.find((x) => x.value === c)?.label || "—";
}
export function calendrierLabel(c: Calendrier | ""): string {
  return CALENDRIERS.find((x) => x.value === c)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: DigitalisationFormData
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
    if (!form.nom_structure.trim() || form.nom_structure.trim().length < 2)
      e.nom_structure = "Nom de la structure requis";
    if (!form.type_structure) e.type_structure = "Type de structure requis";
    if (!form.anciennete) e.anciennete = "Ancienneté requise";
    if (
      !form.description_activite.trim() ||
      form.description_activite.trim().length < 30
    ) {
      e.description_activite =
        "Décrivez brièvement votre activité (30 caractères minimum)";
    }
  }

  if (step === 3) {
    if (!form.pack) e.pack = "Pack envisagé requis";
    if (!form.presence_actuelle)
      e.presence_actuelle = "Présence digitale actuelle requise";
    if (!form.audience) e.audience = "Audience cible requise";
  }

  if (step === 4) {
    if (!form.contenus_dispos)
      e.contenus_dispos = "État des contenus requis";
    if (!form.calendrier) e.calendrier = "Calendrier souhaité requis";
  }

  if (step === 5) {
    if (!form.consentement_examen)
      e.consentement_examen = "Consentement requis";
    if (!form.consentement_traitement)
      e.consentement_traitement = "Consentement requis";
  }

  return e;
}

// ─── QUALIFICATION & FAISABILITÉ ────────────────────────────────────────────

export function requiresSeniorAnalysis(form: DigitalisationFormData): boolean {
  // Pack premium + délai très court
  if (form.pack === "premium" && form.calendrier === "moins_1_mois") {
    return true;
  }
  // Demande complexe sans contenus
  if (
    form.contenus_dispos === "rien" &&
    (form.fonctionnalites.includes("paiement_en_ligne") ||
      form.fonctionnalites.includes("espace_membre") ||
      form.fonctionnalites.includes("multilingue"))
  ) {
    return true;
  }
  // E-commerce sans structure préalable
  if (
    form.fonctionnalites.includes("catalogue_produits") &&
    form.fonctionnalites.includes("paiement_en_ligne") &&
    form.anciennete === "moins_1_an"
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(
  form: DigitalisationFormData
): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute : pack et activité bien cadrés, contenus dispos
  if (
    (form.pack === "essentiel" || form.pack === "pro") &&
    (form.contenus_dispos === "tout_pret" ||
      form.contenus_dispos === "partiel") &&
    form.calendrier !== "moins_1_mois"
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
          "Votre projet est bien cadré, le pack adapté et les contenus disponibles. Devis et calendrier fixes proposés rapidement.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre projet est cohérent. Le conseiller affinera le pack, le périmètre et le calendrier selon les contenus à produire.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Votre demande (pack premium pressé, e-commerce avancé sans contenus, ou structure récente sur fonctionnalités lourdes) nécessite une analyse senior avant tout engagement.",
      };
  }
}

// ─── CHECKLIST ──────────────────────────────────────────────────────────────

export function generateChecklist(form: DigitalisationFormData): string[] {
  const base: string[] = [];

  base.push("Logo (si existant) ou brief d'identité visuelle");
  base.push("Textes de présentation de votre activité");
  base.push("Photos professionnelles (équipe, produits, locaux)");
  base.push("Coordonnées exactes : adresse, téléphones, e-mails, horaires");

  if (
    form.fonctionnalites.includes("catalogue_produits") ||
    form.fonctionnalites.includes("paiement_en_ligne")
  ) {
    base.push("Catalogue produits avec descriptions et prix");
    base.push("Décision sur les modes de paiement acceptés");
  }

  if (form.fonctionnalites.includes("prise_rdv")) {
    base.push("Liste des prestations et durées pour le module RDV");
  }

  if (form.fonctionnalites.includes("multilingue")) {
    base.push("Versions FR + EN des contenus principaux");
  }

  if (form.contenus_dispos === "rien" || form.contenus_dispos === "presque_rien") {
    base.push("Disponibilité pour échanges réguliers afin de produire les contenus");
  }

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  pack: Pack | "",
  contenus: ContenusDispos | "",
  calendrier: Calendrier | ""
): string | null {
  if (!pack) return null;

  if (calendrier === "moins_1_mois") {
    if (pack === "essentiel" && (contenus === "tout_pret" || contenus === "partiel")) {
      return "Livraison express possible : 2 à 4 semaines";
    }
    return "Délai très court : faisabilité à valider en cadrage senior";
  }

  switch (pack) {
    case "essentiel":
      return "Livraison : 3 à 5 semaines selon contenus";
    case "pro":
      return "Livraison : 5 à 8 semaines (design + production + formation)";
    case "premium":
      return "Livraison : 8 à 14 semaines (stratégie + plateforme + automatisation)";
    case "non_defini":
      return "Délai annoncé après cadrage et choix du pack";
    default:
      return null;
  }
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const DIGITALISATION_FORM_STORAGE_KEY = "nexus_digitalisation_draft_v1";
