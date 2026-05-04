// ============================================================================
// NEXUS IA FORM — Source unique de vérité (assistant IA dédié B2B)
// Types, constantes, validation, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type TypeProjet =
  | "faq_client"
  | "prequalif_prospects"
  | "prise_rdv"
  | "support_n1"
  | "concierge_interne"
  | "exploration"
  | "autre";

export type TypeStructure =
  | "commerce_boutique"
  | "service_professionnel"
  | "restaurant_hotellerie"
  | "association_ong"
  | "education_formation"
  | "sante"
  | "agence_cabinet"
  | "tech_numerique"
  | "autre";

export type CanalDeploiement =
  | "site_web"
  | "whatsapp"
  | "facebook"
  | "interne_equipe"
  | "indifferent";

export type VolumeMensuel =
  | "moins_100"
  | "100_500"
  | "500_2000"
  | "plus_2000"
  | "ne_sais_pas";

export type Langues = "francais" | "francais_anglais" | "francais_sango" | "autre";

export type Calendrier =
  | "moins_4_semaines"
  | "4_8_semaines"
  | "2_3_mois"
  | "plus_3_mois"
  | "exploratoire";

export type Budget =
  | "moins_500k"
  | "500k_1m"
  | "1m_3m"
  | "3m_plus"
  | "exploratoire";

export type SourcesContenu =
  | "site_web_existant"
  | "documents_internes"
  | "faq_existante"
  | "rien_a_construire";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface NexusIaFormData {
  // Étape 1 — Demandeur
  nom_complet: string;
  email: string;
  telephone: string;
  nom_structure: string;

  // Étape 2 — Activité
  type_structure: TypeStructure | "";
  description_activite: string;
  audience_cible: string;

  // Étape 3 — Projet IA
  type_projet: TypeProjet | "";
  canaux: string[]; // CanalDeploiement[]
  langues: Langues | "";
  cas_usage: string;

  // Étape 4 — Contenus & calendrier
  sources_contenu: string[]; // SourcesContenu[]
  volume_mensuel: VolumeMensuel | "";
  calendrier: Calendrier | "";
  budget: Budget | "";
  precisions: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
  consentement_donnees: boolean;
}

export type ValidationErrors = Partial<Record<keyof NexusIaFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_NEXUS_IA_FORM: NexusIaFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  nom_structure: "",

  type_structure: "",
  description_activite: "",
  audience_cible: "",

  type_projet: "",
  canaux: [],
  langues: "",
  cas_usage: "",

  sources_contenu: [],
  volume_mensuel: "",
  calendrier: "",
  budget: "",
  precisions: "",

  consentement_examen: false,
  consentement_traitement: false,
  consentement_donnees: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const TYPES_PROJET: { value: TypeProjet; label: string }[] = [
  { value: "faq_client", label: "FAQ client automatisée 24/7" },
  { value: "prequalif_prospects", label: "Pré-qualification de prospects" },
  { value: "prise_rdv", label: "Prise de rendez-vous guidée" },
  { value: "support_n1", label: "Support client de niveau 1" },
  { value: "concierge_interne", label: "Assistant interne pour l'équipe" },
  { value: "exploration", label: "Exploration — usage à définir avec vous" },
  { value: "autre", label: "Autre cas d'usage" },
];

export const TYPES_STRUCTURE: { value: TypeStructure; label: string }[] = [
  { value: "commerce_boutique", label: "Commerce / boutique" },
  { value: "service_professionnel", label: "Service professionnel (B2B/B2C)" },
  { value: "restaurant_hotellerie", label: "Restauration / hôtellerie" },
  { value: "association_ong", label: "Association / ONG" },
  { value: "education_formation", label: "Éducation / formation" },
  { value: "sante", label: "Santé" },
  { value: "agence_cabinet", label: "Agence / cabinet conseil" },
  { value: "tech_numerique", label: "Tech / numérique" },
  { value: "autre", label: "Autre activité" },
];

export const CANAUX: { value: CanalDeploiement; label: string }[] = [
  { value: "site_web", label: "Site web (chat embarqué)" },
  { value: "whatsapp", label: "WhatsApp Business" },
  { value: "facebook", label: "Facebook / Messenger" },
  { value: "interne_equipe", label: "Outil interne pour l'équipe" },
  { value: "indifferent", label: "Indifférent — laissez-moi conseiller" },
];

export const VOLUMES: { value: VolumeMensuel; label: string }[] = [
  { value: "moins_100", label: "Moins de 100 conversations / mois" },
  { value: "100_500", label: "100 à 500 / mois" },
  { value: "500_2000", label: "500 à 2 000 / mois" },
  { value: "plus_2000", label: "Plus de 2 000 / mois" },
  { value: "ne_sais_pas", label: "Je ne sais pas encore" },
];

export const LANGUES_OPTIONS: { value: Langues; label: string }[] = [
  { value: "francais", label: "Français uniquement" },
  { value: "francais_anglais", label: "Français + anglais" },
  { value: "francais_sango", label: "Français + sango" },
  { value: "autre", label: "Autre combinaison" },
];

export const CALENDRIERS: { value: Calendrier; label: string }[] = [
  { value: "moins_4_semaines", label: "Moins de 4 semaines (urgent)" },
  { value: "4_8_semaines", label: "4 à 8 semaines" },
  { value: "2_3_mois", label: "2 à 3 mois" },
  { value: "plus_3_mois", label: "Plus de 3 mois" },
  { value: "exploratoire", label: "Exploratoire — pas de date fixée" },
];

export const BUDGETS: { value: Budget; label: string }[] = [
  { value: "moins_500k", label: "Moins de 500 000 FCFA" },
  { value: "500k_1m", label: "500 000 à 1 million FCFA" },
  { value: "1m_3m", label: "1 à 3 millions FCFA" },
  { value: "3m_plus", label: "Plus de 3 millions FCFA" },
  { value: "exploratoire", label: "Budget ouvert / exploratoire" },
];

export const SOURCES_CONTENU_OPTIONS: { value: SourcesContenu; label: string }[] = [
  { value: "site_web_existant", label: "Site web existant" },
  { value: "documents_internes", label: "Documents internes (PDF, manuels, fiches)" },
  { value: "faq_existante", label: "FAQ ou base de connaissances existante" },
  { value: "rien_a_construire", label: "Rien — base à construire" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function typeProjetLabel(t: TypeProjet | ""): string {
  return TYPES_PROJET.find((x) => x.value === t)?.label || "—";
}
export function typeStructureLabel(t: TypeStructure | ""): string {
  return TYPES_STRUCTURE.find((x) => x.value === t)?.label || "—";
}
export function langueLabel(l: Langues | ""): string {
  return LANGUES_OPTIONS.find((x) => x.value === l)?.label || "—";
}
export function volumeLabel(v: VolumeMensuel | ""): string {
  return VOLUMES.find((x) => x.value === v)?.label || "—";
}
export function calendrierLabel(c: Calendrier | ""): string {
  return CALENDRIERS.find((x) => x.value === c)?.label || "—";
}
export function budgetLabel(b: Budget | ""): string {
  return BUDGETS.find((x) => x.value === b)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: NexusIaFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.nom_structure.trim() || form.nom_structure.trim().length < 2)
      e.nom_structure = "Nom de la structure requis";
  }

  if (step === 2) {
    if (!form.type_structure) e.type_structure = "Type de structure requis";
    if (
      !form.description_activite.trim() ||
      form.description_activite.trim().length < 30
    ) {
      e.description_activite =
        "Décrivez brièvement votre activité (30 caractères minimum)";
    }
    if (!form.audience_cible.trim() || form.audience_cible.trim().length < 10)
      e.audience_cible = "Précisez votre audience (10 caractères minimum)";
  }

  if (step === 3) {
    if (!form.type_projet) e.type_projet = "Type de projet IA requis";
    if (!form.langues) e.langues = "Langues requises";
    if (!form.cas_usage.trim() || form.cas_usage.trim().length < 30)
      e.cas_usage = "Décrivez le cas d'usage cible (30 caractères minimum)";
  }

  if (step === 4) {
    if (!form.volume_mensuel)
      e.volume_mensuel = "Volume mensuel attendu requis";
    if (!form.calendrier) e.calendrier = "Calendrier requis";
    if (!form.budget) e.budget = "Budget requis";
  }

  if (step === 5) {
    if (!form.consentement_examen)
      e.consentement_examen = "Consentement requis";
    if (!form.consentement_traitement)
      e.consentement_traitement = "Consentement requis";
    if (!form.consentement_donnees)
      e.consentement_donnees = "Consentement requis";
  }

  return e;
}

// ─── QUALIFICATION & FAISABILITÉ ────────────────────────────────────────────

export function requiresSeniorAnalysis(form: NexusIaFormData): boolean {
  // Très gros volume + délai très court
  if (
    form.volume_mensuel === "plus_2000" &&
    form.calendrier === "moins_4_semaines"
  ) {
    return true;
  }
  // Budget faible vs volume élevé ou langue complexe
  if (
    form.budget === "moins_500k" &&
    (form.volume_mensuel === "500_2000" ||
      form.volume_mensuel === "plus_2000" ||
      form.langues === "francais_sango" ||
      form.type_projet === "support_n1")
  ) {
    return true;
  }
  // Aucune source de contenu + projet sérieux
  if (
    form.sources_contenu.includes("rien_a_construire") &&
    form.sources_contenu.length === 1 &&
    (form.type_projet === "faq_client" ||
      form.type_projet === "support_n1") &&
    form.calendrier !== "exploratoire" &&
    form.calendrier !== "plus_3_mois"
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: NexusIaFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute : exploration ou périmètre clair, contenus existants
  if (
    (form.type_projet === "exploration" ||
      form.type_projet === "faq_client" ||
      form.type_projet === "prise_rdv") &&
    (form.sources_contenu.includes("site_web_existant") ||
      form.sources_contenu.includes("faq_existante") ||
      form.sources_contenu.includes("documents_internes")) &&
    form.calendrier !== "moins_4_semaines"
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
          "Votre cas d'usage est clair et vous disposez de contenus exploitables. Démo personnalisée et devis fixe sous 48 heures ouvrées.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre projet est cohérent. Le cadrage précisera le périmètre exact, les sources de contenu et le calendrier réaliste.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Volume élevé + délai court, langue rare, ou cas complexe sans contenus existants : un conseiller senior valide la faisabilité avant tout engagement.",
      };
  }
}

// ─── CHECKLIST ──────────────────────────────────────────────────────────────

export function generateChecklist(form: NexusIaFormData): string[] {
  const base: string[] = [
    "Disponibilité d'un référent métier pour le cadrage des contenus",
    "Liste des questions / cas d'usage prioritaires pour la première version",
  ];

  if (form.sources_contenu.includes("site_web_existant")) {
    base.push("URL du site web et autorisation de l'utiliser comme source");
  }
  if (form.sources_contenu.includes("documents_internes")) {
    base.push("Sélection des documents internes à intégrer (PDF, manuels)");
  }
  if (form.sources_contenu.includes("faq_existante")) {
    base.push("Export ou accès à la FAQ existante");
  }
  if (form.sources_contenu.includes("rien_a_construire")) {
    base.push("Disponibilité pour des ateliers de cadrage de contenu");
  }

  if (form.canaux.includes("whatsapp")) {
    base.push("Compte WhatsApp Business validé");
  }
  if (form.canaux.includes("facebook")) {
    base.push("Page Facebook avec accès admin");
  }

  if (form.type_projet === "support_n1") {
    base.push("Procédure d'escalade vers un humain clairement définie");
  }
  if (form.type_projet === "prequalif_prospects") {
    base.push("Critères de qualification (BANT ou équivalent)");
  }

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  type: TypeProjet | "",
  calendrier: Calendrier | "",
  sources: string[]
): string | null {
  if (!type) return null;

  if (calendrier === "exploratoire") {
    return "Calendrier souple : démo + cadrage progressif selon votre rythme";
  }

  const noContent =
    sources.includes("rien_a_construire") && sources.length === 1;

  if (calendrier === "moins_4_semaines") {
    if (
      type === "exploration" ||
      type === "prise_rdv" ||
      (type === "faq_client" && !noContent)
    ) {
      return "Express : démo en 1 semaine, mise en service possible en 3 à 4 semaines";
    }
    return "Délai serré : faisabilité à valider en cadrage senior";
  }

  switch (type) {
    case "exploration":
      return "Cadrage + démo : 1 à 2 semaines";
    case "faq_client":
    case "prise_rdv":
      return "Mise en service : 3 à 5 semaines selon contenus";
    case "prequalif_prospects":
    case "concierge_interne":
      return "Mise en service : 4 à 8 semaines";
    case "support_n1":
      return "Mise en service : 6 à 10 semaines (procédures + tests)";
    default:
      return "Délai annoncé après cadrage";
  }
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const NEXUS_IA_FORM_STORAGE_KEY = "nexus_ia_draft_v1";
