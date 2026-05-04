// ============================================================================
// FINANCEMENT FORM — Source unique de vérité
// Types, constantes, validation, règles de qualification, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type PaysResidence =
  | "RCA"
  | "Cameroun"
  | "France"
  | "Canada"
  | "Belgique"
  | "Autre";

export type ProfilPorteur =
  | "jeune_entrepreneur"
  | "commercant"
  | "professionnel"
  | "groupe_associes"
  | "diaspora_investisseur"
  | "autre";

export type Secteur =
  | "agriculture_elevage"
  | "agroalimentaire"
  | "commerce_distribution"
  | "services_bts"
  | "education_formation"
  | "sante"
  | "tech_numerique"
  | "industrie_manufacture"
  | "tourisme_hotellerie"
  | "btp_construction"
  | "energie_environnement"
  | "transport_logistique"
  | "autre";

export type StadeProjet =
  | "idee"
  | "etude"
  | "pre_lancement"
  | "active_recente"
  | "active_etablie";

export type MontantRecherche =
  | "moins_5m"
  | "5_15m"
  | "15_50m"
  | "50_100m"
  | "100m_plus";

export type ApportPersonnel =
  | "moins_5_pct"
  | "5_15_pct"
  | "15_30_pct"
  | "30_50_pct"
  | "plus_50_pct"
  | "non_chiffre";

export type Equipe = "seul" | "binome" | "petite_equipe" | "famille" | "autre";

export type Engagement = "temps_plein" | "temps_partiel" | "non_defini";

export type ExperienceSecteur =
  | "aucune"
  | "moins_2_ans"
  | "2_5_ans"
  | "5_10_ans"
  | "plus_10_ans";

export type StructureExistante =
  | "personne_physique"
  | "registre_commerce"
  | "societe_immatriculee"
  | "association"
  | "autre";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface FinancementFormData {
  // Étape 1 — Profil porteur
  nom_complet: string;
  email: string;
  telephone: string;
  pays_residence: PaysResidence | "";
  profil_porteur: ProfilPorteur | "";

  // Étape 2 — Votre projet
  nom_projet: string;
  secteur: Secteur | "";
  stade: StadeProjet | "";
  localisation_projet: string;
  description_courte: string;
  montant_recherche: MontantRecherche | "";

  // Étape 3 — Engagement personnel
  apport_personnel: ApportPersonnel | "";
  equipe: Equipe | "";
  engagement_porteur: Engagement | "";
  experience_secteur: ExperienceSecteur | "";

  // Étape 4 — Situation
  structure_existante: StructureExistante | "";
  documents_disponibles: string[];
  ancrage_rca: string;
  vision_long_terme: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<
  Record<keyof FinancementFormData, string>
>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_FINANCEMENT_FORM: FinancementFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays_residence: "",
  profil_porteur: "",

  nom_projet: "",
  secteur: "",
  stade: "",
  localisation_projet: "",
  description_courte: "",
  montant_recherche: "",

  apport_personnel: "",
  equipe: "",
  engagement_porteur: "",
  experience_secteur: "",

  structure_existante: "",
  documents_disponibles: [],
  ancrage_rca: "",
  vision_long_terme: "",

  consentement_examen: false,
  consentement_traitement: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const PAYS_RESIDENCE_OPTIONS: { value: PaysResidence; label: string }[] =
  [
    { value: "RCA", label: "République Centrafricaine" },
    { value: "Cameroun", label: "Cameroun" },
    { value: "France", label: "France" },
    { value: "Canada", label: "Canada" },
    { value: "Belgique", label: "Belgique" },
    { value: "Autre", label: "Autre" },
  ];

export const PROFILS_PORTEUR: { value: ProfilPorteur; label: string }[] = [
  { value: "jeune_entrepreneur", label: "Jeune entrepreneur" },
  { value: "commercant", label: "Commerçant / artisan" },
  { value: "professionnel", label: "Professionnel installé" },
  { value: "groupe_associes", label: "Groupe d'associés" },
  { value: "diaspora_investisseur", label: "Diaspora / investisseur" },
  { value: "autre", label: "Autre" },
];

export const SECTEURS: { value: Secteur; label: string }[] = [
  { value: "agriculture_elevage", label: "Agriculture & élevage" },
  { value: "agroalimentaire", label: "Agroalimentaire & transformation" },
  { value: "commerce_distribution", label: "Commerce & distribution" },
  { value: "services_bts", label: "Services aux entreprises (B2B)" },
  { value: "education_formation", label: "Éducation & formation" },
  { value: "sante", label: "Santé" },
  { value: "tech_numerique", label: "Tech & numérique" },
  { value: "industrie_manufacture", label: "Industrie & manufacture" },
  { value: "tourisme_hotellerie", label: "Tourisme & hôtellerie" },
  { value: "btp_construction", label: "BTP & construction" },
  { value: "energie_environnement", label: "Énergie & environnement" },
  { value: "transport_logistique", label: "Transport & logistique" },
  { value: "autre", label: "Autre" },
];

export const STADES: { value: StadeProjet; label: string }[] = [
  { value: "idee", label: "Idée — pas encore structurée" },
  { value: "etude", label: "À l'étude — analyses en cours" },
  { value: "pre_lancement", label: "Pré-lancement — prêt à démarrer" },
  { value: "active_recente", label: "Activité lancée (moins de 2 ans)" },
  { value: "active_etablie", label: "Activité établie (2 ans et plus)" },
];

export const MONTANTS: { value: MontantRecherche; label: string }[] = [
  { value: "moins_5m", label: "Moins de 5 millions FCFA" },
  { value: "5_15m", label: "5 à 15 millions FCFA" },
  { value: "15_50m", label: "15 à 50 millions FCFA" },
  { value: "50_100m", label: "50 à 100 millions FCFA" },
  { value: "100m_plus", label: "Plus de 100 millions FCFA" },
];

export const APPORTS: { value: ApportPersonnel; label: string }[] = [
  { value: "moins_5_pct", label: "Moins de 5 % du montant recherché" },
  { value: "5_15_pct", label: "5 à 15 %" },
  { value: "15_30_pct", label: "15 à 30 %" },
  { value: "30_50_pct", label: "30 à 50 %" },
  { value: "plus_50_pct", label: "Plus de 50 %" },
  { value: "non_chiffre", label: "Non chiffré pour le moment" },
];

export const EQUIPES: { value: Equipe; label: string }[] = [
  { value: "seul", label: "Seul porteur" },
  { value: "binome", label: "Binôme" },
  { value: "petite_equipe", label: "Petite équipe (3 à 6 personnes)" },
  { value: "famille", label: "Projet familial" },
  { value: "autre", label: "Autre configuration" },
];

export const ENGAGEMENTS: { value: Engagement; label: string }[] = [
  { value: "temps_plein", label: "Temps plein dédié au projet" },
  { value: "temps_partiel", label: "Temps partiel pour le moment" },
  { value: "non_defini", label: "Non encore défini" },
];

export const EXPERIENCES_SECTEUR: {
  value: ExperienceSecteur;
  label: string;
}[] = [
  { value: "aucune", label: "Aucune expérience préalable" },
  { value: "moins_2_ans", label: "Moins de 2 ans" },
  { value: "2_5_ans", label: "2 à 5 ans" },
  { value: "5_10_ans", label: "5 à 10 ans" },
  { value: "plus_10_ans", label: "Plus de 10 ans" },
];

export const STRUCTURES: { value: StructureExistante; label: string }[] = [
  { value: "personne_physique", label: "Personne physique" },
  { value: "registre_commerce", label: "Inscrit(e) au registre du commerce" },
  { value: "societe_immatriculee", label: "Société immatriculée" },
  { value: "association", label: "Association" },
  { value: "autre", label: "Autre / à clarifier" },
];

export const DOCUMENTS_OPTIONS: { value: string; label: string }[] = [
  { value: "pitch", label: "Pitch deck ou présentation du projet" },
  { value: "business_plan", label: "Business plan" },
  { value: "etats_financiers", label: "États financiers (si activité existante)" },
  { value: "statuts", label: "Statuts / registre de commerce" },
  { value: "devis_fournisseurs", label: "Devis fournisseurs" },
  { value: "lettres_intention", label: "Lettres d'intention clients ou partenaires" },
  { value: "cv_equipe", label: "CV des membres de l'équipe" },
  { value: "etudes_marche", label: "Étude de marché" },
  { value: "piece_identite", label: "Pièce d'identité du porteur" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function profilPorteurLabel(p: ProfilPorteur | ""): string {
  return PROFILS_PORTEUR.find((x) => x.value === p)?.label || "—";
}
export function secteurLabel(s: Secteur | ""): string {
  return SECTEURS.find((x) => x.value === s)?.label || "—";
}
export function stadeLabel(s: StadeProjet | ""): string {
  return STADES.find((x) => x.value === s)?.label || "—";
}
export function montantLabel(m: MontantRecherche | ""): string {
  return MONTANTS.find((x) => x.value === m)?.label || "—";
}
export function apportLabel(a: ApportPersonnel | ""): string {
  return APPORTS.find((x) => x.value === a)?.label || "—";
}
export function equipeLabel(e: Equipe | ""): string {
  return EQUIPES.find((x) => x.value === e)?.label || "—";
}
export function engagementLabel(e: Engagement | ""): string {
  return ENGAGEMENTS.find((x) => x.value === e)?.label || "—";
}
export function experienceLabel(e: ExperienceSecteur | ""): string {
  return EXPERIENCES_SECTEUR.find((x) => x.value === e)?.label || "—";
}
export function structureLabel(s: StructureExistante | ""): string {
  return STRUCTURES.find((x) => x.value === s)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: FinancementFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.pays_residence) e.pays_residence = "Pays de résidence requis";
    if (!form.profil_porteur) e.profil_porteur = "Profil du porteur requis";
  }

  if (step === 2) {
    if (!form.nom_projet.trim() || form.nom_projet.trim().length < 3)
      e.nom_projet = "Nom du projet requis";
    if (!form.secteur) e.secteur = "Secteur d'activité requis";
    if (!form.stade) e.stade = "Stade du projet requis";
    if (!form.localisation_projet.trim())
      e.localisation_projet = "Localisation du projet requise";
    if (!form.description_courte.trim() || form.description_courte.trim().length < 30)
      e.description_courte =
        "Description courte requise (30 caractères minimum)";
    if (!form.montant_recherche)
      e.montant_recherche = "Fourchette de financement requise";
  }

  if (step === 3) {
    if (!form.apport_personnel)
      e.apport_personnel = "Apport personnel requis";
    if (!form.equipe) e.equipe = "Configuration d'équipe requise";
    if (!form.engagement_porteur)
      e.engagement_porteur = "Niveau d'engagement requis";
    if (!form.experience_secteur)
      e.experience_secteur = "Expérience dans le secteur requise";
  }

  if (step === 4) {
    if (!form.structure_existante)
      e.structure_existante = "Structure juridique requise";
    if (!form.ancrage_rca.trim() || form.ancrage_rca.trim().length < 10)
      e.ancrage_rca = "Précisez votre lien avec la RCA (10 caractères minimum)";
    if (!form.vision_long_terme.trim() || form.vision_long_terme.trim().length < 30)
      e.vision_long_terme =
        "Précisez votre vision long terme (30 caractères minimum)";
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

export function requiresSeniorAnalysis(form: FinancementFormData): boolean {
  // Apport très faible
  if (form.apport_personnel === "moins_5_pct") return true;
  // Gros montant + premier projet
  if (
    (form.montant_recherche === "50_100m" ||
      form.montant_recherche === "100m_plus") &&
    form.experience_secteur === "aucune"
  ) {
    return true;
  }
  // Idée brute + gros montant
  if (
    form.stade === "idee" &&
    (form.montant_recherche === "50_100m" ||
      form.montant_recherche === "100m_plus")
  ) {
    return true;
  }
  // Engagement non défini sur projet sérieux
  if (
    form.engagement_porteur === "non_defini" &&
    form.montant_recherche !== "moins_5m"
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: FinancementFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute
  if (
    (form.apport_personnel === "30_50_pct" ||
      form.apport_personnel === "plus_50_pct") &&
    (form.experience_secteur === "5_10_ans" ||
      form.experience_secteur === "plus_10_ans") &&
    form.engagement_porteur === "temps_plein" &&
    (form.stade === "pre_lancement" ||
      form.stade === "active_recente" ||
      form.stade === "active_etablie")
  ) {
    return "haute";
  }
  if (
    form.apport_personnel === "plus_50_pct" &&
    form.engagement_porteur === "temps_plein"
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
          "Votre projet présente des éléments très favorables (apport, expérience, engagement). Sous réserve de l'analyse complète, ce projet est porteur pour un partenariat.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre projet est cohérent. La structuration et l'engagement du porteur seront déterminants. Notre conseiller affinera l'évaluation.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Votre situation nécessite une analyse approfondie par un conseiller senior avant tout engagement. Nous vous contacterons sous 24 heures ouvrées.",
      };
  }
}

// ─── CHECKLIST DOCUMENTS ────────────────────────────────────────────────────

export function generateChecklist(
  stade: StadeProjet | "",
  structure: StructureExistante | ""
): string[] {
  if (!stade) return [];

  const base = [
    "Présentation détaillée du projet (pitch deck ou document écrit)",
    "Pièce d'identité du porteur",
    "CV du porteur et de l'équipe",
    "Vision long terme et plan d'action",
  ];

  if (stade === "etude" || stade === "pre_lancement") {
    base.push("Étude de marché ou analyse de la concurrence");
    base.push("Devis fournisseurs principaux");
    base.push("Plan financier prévisionnel");
  }

  if (stade === "active_recente" || stade === "active_etablie") {
    base.push("États financiers des 12 derniers mois");
    base.push("Liste des clients ou contrats en cours");
    base.push("Situation des dettes éventuelles (transparence requise)");
  }

  if (
    structure === "registre_commerce" ||
    structure === "societe_immatriculee" ||
    structure === "association"
  ) {
    base.push("Statuts et documents juridiques de la structure");
    base.push("Numéro d'immatriculation officiel");
  }

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  stade: StadeProjet | "",
  montant: MontantRecherche | ""
): string | null {
  if (!stade || !montant) return null;

  if (stade === "idee") {
    return "Phase de structuration nécessaire avant tout cofinancement (6 à 12 mois)";
  }
  if (
    montant === "50_100m" ||
    montant === "100m_plus"
  ) {
    return "Étude approfondie + montage : 3 à 6 mois minimum";
  }
  if (montant === "15_50m") {
    return "Étude + structuration : 2 à 4 mois";
  }
  return "Étude + structuration : 1 à 3 mois selon la maturité du projet";
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const FINANCEMENT_FORM_STORAGE_KEY = "nexus_financement_draft_v1";
