// ============================================================================
// BOURSES CANADA FORM — Source unique de vérité
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

export type TrancheAge = "18_25" | "26_30" | "31_35" | "36_plus";

export type NiveauActuel =
  | "lycee_terminale"
  | "bac_obtenu"
  | "bac_plus_2"
  | "licence"
  | "master"
  | "doctorat"
  | "professionnel";

export type NiveauVise =
  | "cegep"
  | "licence_bachelor"
  | "master_maitrise"
  | "doctorat"
  | "formation_pro";

export type Domaine =
  | "sciences_ingenierie"
  | "sante"
  | "sciences_sociales"
  | "gestion_commerce"
  | "informatique"
  | "arts_lettres"
  | "education"
  | "metiers_techniques"
  | "agriculture"
  | "autre";

export type ProvinceCible =
  | "quebec"
  | "ontario"
  | "colombie_britannique"
  | "alberta"
  | "manitoba"
  | "nouveau_brunswick"
  | "ouvert"
  | "autre";

export type Calendrier =
  | "moins_3_mois"
  | "3_6_mois"
  | "6_12_mois"
  | "plus_12_mois"
  | "non_defini";

export type MoyenneRange =
  | "moins_10"
  | "10_12"
  | "12_14"
  | "14_16"
  | "16_plus";

export type FrancaisLevel =
  | "natif"
  | "courant_b2_c1"
  | "intermediaire_b1"
  | "elementaire_a2"
  | "non_evalue";

export type AnglaisLevel =
  | "courant_b2_c1"
  | "intermediaire_b1"
  | "elementaire_a2"
  | "aucun";

export type FinancementSource =
  | "famille"
  | "epargne_personnelle"
  | "pret"
  | "vente_bien"
  | "bourse_indispensable"
  | "autre";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface BoursesFormData {
  // Étape 1 — Profil candidat
  nom_complet: string;
  email: string;
  telephone: string;
  pays_residence: PaysResidence | "";
  tranche_age: TrancheAge | "";
  niveau_actuel: NiveauActuel | "";

  // Étape 2 — Projet d'études
  niveau_vise: NiveauVise | "";
  domaine: Domaine | "";
  province_cible: ProvinceCible | "";
  calendrier: Calendrier | "";
  rentree_souhaitee: string; // YYYY-MM (mois cible)

  // Étape 3 — Parcours académique
  derniere_moyenne: MoyenneRange | "";
  diplomes_obtenus: string[];
  francais_niveau: FrancaisLevel | "";
  anglais_niveau: AnglaisLevel | "";
  tcf_passe: "" | "oui" | "non" | "prevu";

  // Étape 4 — Situation financière + ancrage
  financement_source: FinancementSource | "";
  budget_annuel: string;
  ancrage_rca: string;
  raison_choix_canada: string;
  documents_disponibles: string[];

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<Record<keyof BoursesFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_BOURSES_FORM: BoursesFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays_residence: "",
  tranche_age: "",
  niveau_actuel: "",

  niveau_vise: "",
  domaine: "",
  province_cible: "",
  calendrier: "",
  rentree_souhaitee: "",

  derniere_moyenne: "",
  diplomes_obtenus: [],
  francais_niveau: "",
  anglais_niveau: "",
  tcf_passe: "",

  financement_source: "",
  budget_annuel: "",
  ancrage_rca: "",
  raison_choix_canada: "",
  documents_disponibles: [],

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

export const TRANCHES_AGE: { value: TrancheAge; label: string }[] = [
  { value: "18_25", label: "18 – 25 ans" },
  { value: "26_30", label: "26 – 30 ans" },
  { value: "31_35", label: "31 – 35 ans" },
  { value: "36_plus", label: "36 ans et plus" },
];

export const NIVEAUX_ACTUELS: { value: NiveauActuel; label: string }[] = [
  { value: "lycee_terminale", label: "Lycée / classe de Terminale" },
  { value: "bac_obtenu", label: "Baccalauréat obtenu" },
  { value: "bac_plus_2", label: "Bac+2 (BTS, DUT, etc.)" },
  { value: "licence", label: "Licence / Bachelor" },
  { value: "master", label: "Master / Maîtrise" },
  { value: "doctorat", label: "Doctorat" },
  { value: "professionnel", label: "Diplôme professionnel" },
];

export const NIVEAUX_VISES: {
  value: NiveauVise;
  label: string;
  description: string;
}[] = [
  {
    value: "cegep",
    label: "Cégep / Collège",
    description: "Formation technique, 1 à 3 ans, orientation emploi.",
  },
  {
    value: "licence_bachelor",
    label: "Licence / Bachelor",
    description: "Premier cycle universitaire, 3 à 4 ans.",
  },
  {
    value: "master_maitrise",
    label: "Master / Maîtrise",
    description: "Deuxième cycle universitaire, 1 à 2 ans.",
  },
  {
    value: "doctorat",
    label: "Doctorat",
    description: "Troisième cycle, 3 à 5 ans.",
  },
  {
    value: "formation_pro",
    label: "Formation professionnelle",
    description: "Métiers spécialisés, durée variable.",
  },
];

export const DOMAINES: { value: Domaine; label: string }[] = [
  { value: "sciences_ingenierie", label: "Sciences & ingénierie" },
  { value: "sante", label: "Santé & médecine" },
  { value: "sciences_sociales", label: "Sciences sociales & humaines" },
  { value: "gestion_commerce", label: "Gestion & commerce" },
  { value: "informatique", label: "Informatique & numérique" },
  { value: "arts_lettres", label: "Arts & lettres" },
  { value: "education", label: "Éducation & enseignement" },
  { value: "metiers_techniques", label: "Métiers techniques" },
  { value: "agriculture", label: "Agriculture & environnement" },
  { value: "autre", label: "Autre / non défini" },
];

export const PROVINCES: { value: ProvinceCible; label: string }[] = [
  { value: "quebec", label: "Québec" },
  { value: "ontario", label: "Ontario" },
  { value: "colombie_britannique", label: "Colombie-Britannique" },
  { value: "alberta", label: "Alberta" },
  { value: "manitoba", label: "Manitoba" },
  { value: "nouveau_brunswick", label: "Nouveau-Brunswick" },
  { value: "ouvert", label: "Ouvert à toute province" },
  { value: "autre", label: "Autre" },
];

export const CALENDRIERS: { value: Calendrier; label: string }[] = [
  { value: "moins_3_mois", label: "Moins de 3 mois" },
  { value: "3_6_mois", label: "3 à 6 mois" },
  { value: "6_12_mois", label: "6 à 12 mois" },
  { value: "plus_12_mois", label: "Plus de 12 mois" },
  { value: "non_defini", label: "Non défini" },
];

export const MOYENNES: { value: MoyenneRange; label: string }[] = [
  { value: "moins_10", label: "Moins de 10/20" },
  { value: "10_12", label: "10 à 12/20" },
  { value: "12_14", label: "12 à 14/20 (assez bien)" },
  { value: "14_16", label: "14 à 16/20 (bien)" },
  { value: "16_plus", label: "16/20 et plus (très bien)" },
];

export const FRANCAIS_LEVELS: { value: FrancaisLevel; label: string }[] = [
  { value: "natif", label: "Langue maternelle / natif" },
  { value: "courant_b2_c1", label: "Courant (B2 – C1)" },
  { value: "intermediaire_b1", label: "Intermédiaire (B1)" },
  { value: "elementaire_a2", label: "Élémentaire (A2)" },
  { value: "non_evalue", label: "Non évalué" },
];

export const ANGLAIS_LEVELS: { value: AnglaisLevel; label: string }[] = [
  { value: "courant_b2_c1", label: "Courant (B2 – C1)" },
  { value: "intermediaire_b1", label: "Intermédiaire (B1)" },
  { value: "elementaire_a2", label: "Élémentaire (A2)" },
  { value: "aucun", label: "Pas de notion" },
];

export const FINANCEMENT_OPTIONS: {
  value: FinancementSource;
  label: string;
}[] = [
  { value: "famille", label: "Soutien familial" },
  { value: "epargne_personnelle", label: "Épargne personnelle" },
  { value: "pret", label: "Prêt bancaire ou organisme" },
  { value: "vente_bien", label: "Vente d'un bien" },
  {
    value: "bourse_indispensable",
    label: "Bourse indispensable au projet",
  },
  { value: "autre", label: "Autre / à préciser" },
];

export const DIPLOMES_OPTIONS: { value: string; label: string }[] = [
  { value: "bepc", label: "BEPC / Brevet" },
  { value: "bac", label: "Baccalauréat" },
  { value: "bts_dut", label: "BTS / DUT" },
  { value: "licence", label: "Licence / Bachelor" },
  { value: "master", label: "Master / Maîtrise" },
  { value: "doctorat", label: "Doctorat" },
  { value: "professionnel", label: "Diplôme professionnel" },
];

export const DOCUMENTS_OPTIONS: { value: string; label: string }[] = [
  { value: "passeport", label: "Passeport en cours de validité" },
  { value: "diplomes", label: "Diplômes (originaux ou copies certifiées)" },
  { value: "releves_notes", label: "Relevés de notes complets" },
  { value: "cv", label: "CV académique ou professionnel" },
  { value: "lettre_motivation", label: "Lettre de motivation rédigée" },
  { value: "lettres_reco", label: "Lettres de recommandation" },
  { value: "tcf_resultats", label: "Résultats TCF/TEF (langue française)" },
  { value: "ielts_toefl", label: "Résultats IELTS/TOEFL (anglais)" },
  { value: "justificatifs_financiers", label: "Justificatifs financiers" },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function niveauActuelLabel(n: NiveauActuel | ""): string {
  return NIVEAUX_ACTUELS.find((x) => x.value === n)?.label || "—";
}
export function niveauViseLabel(n: NiveauVise | ""): string {
  return NIVEAUX_VISES.find((x) => x.value === n)?.label || "—";
}
export function domaineLabel(d: Domaine | ""): string {
  return DOMAINES.find((x) => x.value === d)?.label || "—";
}
export function provinceLabel(p: ProvinceCible | ""): string {
  return PROVINCES.find((x) => x.value === p)?.label || "—";
}
export function calendrierLabel(c: Calendrier | ""): string {
  return CALENDRIERS.find((x) => x.value === c)?.label || "—";
}
export function moyenneLabel(m: MoyenneRange | ""): string {
  return MOYENNES.find((x) => x.value === m)?.label || "—";
}
export function francaisLabel(f: FrancaisLevel | ""): string {
  return FRANCAIS_LEVELS.find((x) => x.value === f)?.label || "—";
}
export function anglaisLabel(a: AnglaisLevel | ""): string {
  return ANGLAIS_LEVELS.find((x) => x.value === a)?.label || "—";
}
export function financementLabel(f: FinancementSource | ""): string {
  return FINANCEMENT_OPTIONS.find((x) => x.value === f)?.label || "—";
}
export function trancheAgeLabel(t: TrancheAge | ""): string {
  return TRANCHES_AGE.find((x) => x.value === t)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: BoursesFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.pays_residence) e.pays_residence = "Pays de résidence requis";
    if (!form.tranche_age) e.tranche_age = "Tranche d'âge requise";
    if (!form.niveau_actuel)
      e.niveau_actuel = "Niveau d'études actuel requis";
  }

  if (step === 2) {
    if (!form.niveau_vise) e.niveau_vise = "Niveau visé requis";
    if (!form.domaine) e.domaine = "Domaine requis";
    if (!form.province_cible) e.province_cible = "Province cible requise";
    if (!form.calendrier) e.calendrier = "Calendrier requis";
  }

  if (step === 3) {
    if (!form.derniere_moyenne)
      e.derniere_moyenne = "Moyenne requise";
    if (!form.francais_niveau)
      e.francais_niveau = "Niveau de français requis";
    if (!form.tcf_passe) e.tcf_passe = "Merci de répondre à cette question";
  }

  if (step === 4) {
    if (!form.financement_source)
      e.financement_source = "Source de financement requise";
    if (!form.ancrage_rca.trim() || form.ancrage_rca.trim().length < 10)
      e.ancrage_rca = "Précisez votre lien avec la RCA (10 caractères minimum)";
    if (
      !form.raison_choix_canada.trim() ||
      form.raison_choix_canada.trim().length < 20
    )
      e.raison_choix_canada =
        "Précisez votre motivation (20 caractères minimum)";
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

export function requiresSeniorAnalysis(form: BoursesFormData): boolean {
  // Calendrier trop serré
  if (form.calendrier === "moins_3_mois") return true;
  // Moyenne très faible
  if (form.derniere_moyenne === "moins_10") return true;
  // Bourse indispensable + niveau visé élevé sans bonne moyenne
  // (le cas "moins_10" est déjà filtré au-dessus)
  if (
    form.financement_source === "bourse_indispensable" &&
    (form.niveau_vise === "master_maitrise" ||
      form.niveau_vise === "doctorat") &&
    form.derniere_moyenne === "10_12"
  ) {
    return true;
  }
  // Doctorat sans master déclaré
  if (
    form.niveau_vise === "doctorat" &&
    form.niveau_actuel !== "master" &&
    form.niveau_actuel !== "doctorat"
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: BoursesFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute
  if (
    (form.derniere_moyenne === "14_16" ||
      form.derniere_moyenne === "16_plus") &&
    (form.francais_niveau === "natif" ||
      form.francais_niveau === "courant_b2_c1") &&
    form.calendrier !== "moins_3_mois" &&
    form.financement_source !== "bourse_indispensable"
  ) {
    return "haute";
  }
  if (
    form.derniere_moyenne === "16_plus" &&
    form.tcf_passe === "oui" &&
    form.calendrier === "plus_12_mois"
  ) {
    return "haute";
  }

  // Faisabilité moyenne par défaut
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
          "Votre profil présente des éléments favorables (résultats académiques, niveau de langue, calendrier). Sous réserve de l'analyse complète, ce projet est porteur.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre profil est cohérent. La stratégie d'établissement et la complétude du dossier seront déterminantes. Notre conseiller affinera l'évaluation.",
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

// ─── CHECKLIST DOCUMENTS GÉNÉRÉE ────────────────────────────────────────────

export function generateChecklist(
  niveauVise: NiveauVise | "",
  province: ProvinceCible | ""
): string[] {
  if (!niveauVise) return [];

  const base = [
    "Passeport en cours de validité (toutes pages utiles)",
    "Diplômes obtenus (originaux ou copies certifiées conformes)",
    "Relevés de notes complets de votre dernier cycle d'études",
    "CV académique structuré",
    "Lettre de motivation rédigée selon les standards canadiens",
  ];

  if (
    niveauVise === "licence_bachelor" ||
    niveauVise === "master_maitrise" ||
    niveauVise === "doctorat"
  ) {
    base.push("2 à 3 lettres de recommandation");
  }

  if (niveauVise === "doctorat") {
    base.push("Projet de recherche détaillé");
    base.push("Lettre d'acceptation préliminaire d'un directeur de recherche");
  }

  base.push("Justificatifs financiers (couvrant les frais + vie courante)");

  if (province === "quebec") {
    base.push("Préparation au CAQ (Certificat d'acceptation du Québec)");
  } else {
    base.push("Préparation à l'attestation provinciale d'études (PAL)");
  }

  base.push("Dépôt biométrique à Yaoundé pour le permis d'études IRCC");

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  calendrier: Calendrier | "",
  niveauVise: NiveauVise | ""
): string | null {
  if (!calendrier || !niveauVise) return null;

  if (calendrier === "moins_3_mois") {
    return "Calendrier très serré — analyse en priorité requise";
  }
  if (calendrier === "3_6_mois") {
    return "Calendrier exigeant — admission possible en session d'hiver ou été selon profil";
  }
  if (calendrier === "6_12_mois") {
    return "Calendrier optimal — préparation complète possible pour la prochaine rentrée d'automne";
  }
  if (calendrier === "plus_12_mois") {
    return "Calendrier confortable — temps suffisant pour une stratégie d'établissement multiple et la recherche d'aides financières";
  }

  return null;
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const BOURSES_FORM_STORAGE_KEY = "nexus_bourses_draft_v1";
