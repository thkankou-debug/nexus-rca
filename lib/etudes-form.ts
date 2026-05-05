// ============================================================================
// ÉTUDES CANADA FORM — Source unique de vérité
// Focus admission + permis IRCC (le financement est traité dans bourses-form).
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

export type AdmissionStatus =
  | "non_demande"
  | "en_recherche"
  | "candidature_envoyee"
  | "admission_recue";

export type EtablissementsCibles =
  | "un_etablissement"
  | "deux_a_trois"
  | "quatre_plus"
  | "indecis";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface EtudesFormData {
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
  rentree_souhaitee: string; // YYYY-MM

  // Étape 3 — Parcours académique
  derniere_moyenne: MoyenneRange | "";
  diplomes_obtenus: string[];
  francais_niveau: FrancaisLevel | "";
  anglais_niveau: AnglaisLevel | "";
  tcf_passe: "" | "oui" | "non" | "prevu";

  // Étape 4 — Situation admission + ancrage
  admission_status: AdmissionStatus | "";
  etablissements_cibles: EtablissementsCibles | "";
  ancrage_rca: string;
  raison_choix_canada: string;
  documents_disponibles: string[];

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<Record<keyof EtudesFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_ETUDES_FORM: EtudesFormData = {
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

  admission_status: "",
  etablissements_cibles: "",
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

export const NIVEAUX_VISES: { value: NiveauVise; label: string }[] = [
  { value: "cegep", label: "Cégep / Collège" },
  { value: "licence_bachelor", label: "Licence / Bachelor" },
  { value: "master_maitrise", label: "Master / Maîtrise" },
  { value: "doctorat", label: "Doctorat" },
  { value: "formation_pro", label: "Formation professionnelle" },
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

export const ADMISSION_STATUS_OPTIONS: {
  value: AdmissionStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "non_demande",
    label: "Pas encore demandée",
    description: "Vous démarrez le projet — nous structurons l'identification.",
  },
  {
    value: "en_recherche",
    label: "Recherche d'établissements en cours",
    description: "Vous cherchez les programmes alignés à votre profil.",
  },
  {
    value: "candidature_envoyee",
    label: "Candidatures envoyées",
    description: "Vous attendez une réponse d'un ou plusieurs établissements.",
  },
  {
    value: "admission_recue",
    label: "Admission déjà reçue",
    description:
      "Vous avez une lettre d'admission — focus sur le permis d'études.",
  },
];

export const ETABLISSEMENTS_CIBLES_OPTIONS: {
  value: EtablissementsCibles;
  label: string;
}[] = [
  { value: "un_etablissement", label: "Un seul établissement précis" },
  { value: "deux_a_trois", label: "2 à 3 établissements ciblés" },
  { value: "quatre_plus", label: "4 établissements ou plus" },
  { value: "indecis", label: "Pas encore décidé(e)" },
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
  { value: "lettre_admission", label: "Lettre d'admission reçue" },
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
export function admissionStatusLabel(s: AdmissionStatus | ""): string {
  return ADMISSION_STATUS_OPTIONS.find((x) => x.value === s)?.label || "—";
}
export function etablissementsCiblesLabel(
  e: EtablissementsCibles | ""
): string {
  return ETABLISSEMENTS_CIBLES_OPTIONS.find((x) => x.value === e)?.label || "—";
}
export function trancheAgeLabel(t: TrancheAge | ""): string {
  return TRANCHES_AGE.find((x) => x.value === t)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: EtudesFormData
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
    if (!form.derniere_moyenne) e.derniere_moyenne = "Moyenne requise";
    if (!form.francais_niveau)
      e.francais_niveau = "Niveau de français requis";
    if (!form.tcf_passe) e.tcf_passe = "Merci de répondre à cette question";
  }

  if (step === 4) {
    if (!form.admission_status)
      e.admission_status = "État d'avancement de l'admission requis";
    if (!form.etablissements_cibles)
      e.etablissements_cibles = "Nombre d'établissements ciblés requis";
    if (!form.ancrage_rca.trim() || form.ancrage_rca.trim().length < 10)
      e.ancrage_rca =
        "Précisez votre lien avec la RCA (10 caractères minimum)";
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

// ─── QUALIFICATION & FAISABILITÉ (focus admission) ──────────────────────────

export function requiresSeniorAnalysis(form: EtudesFormData): boolean {
  // Calendrier trop serré
  if (form.calendrier === "moins_3_mois") return true;
  // Moyenne très faible
  if (form.derniere_moyenne === "moins_10") return true;
  // Doctorat sans master déclaré
  if (
    form.niveau_vise === "doctorat" &&
    form.niveau_actuel !== "master" &&
    form.niveau_actuel !== "doctorat"
  ) {
    return true;
  }
  // Calendrier 3-6 mois sans candidature envoyée pour master/doctorat
  if (
    form.calendrier === "3_6_mois" &&
    (form.niveau_vise === "master_maitrise" ||
      form.niveau_vise === "doctorat") &&
    (form.admission_status === "non_demande" ||
      form.admission_status === "en_recherche")
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: EtudesFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute : admission reçue → focus permis (très favorable)
  if (form.admission_status === "admission_recue") {
    return "haute";
  }

  // Faisabilité haute : profil académique solide + langue maîtrisée + délais OK
  if (
    (form.derniere_moyenne === "14_16" ||
      form.derniere_moyenne === "16_plus") &&
    (form.francais_niveau === "natif" ||
      form.francais_niveau === "courant_b2_c1") &&
    form.calendrier !== "moins_3_mois" &&
    form.calendrier !== "3_6_mois"
  ) {
    return "haute";
  }

  // Faisabilité haute : candidatures envoyées + bons résultats + bon niveau langue
  if (
    form.admission_status === "candidature_envoyee" &&
    (form.derniere_moyenne === "14_16" ||
      form.derniere_moyenne === "16_plus") &&
    form.tcf_passe === "oui"
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
          "Votre profil et votre état d'avancement sont favorables. Sous réserve de l'analyse complète, le projet est porteur — qu'il s'agisse de finaliser l'admission ou de sécuriser le permis d'études.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre projet est cohérent. La stratégie d'établissement, la complétude du dossier et le timing seront déterminants. Notre conseiller affinera l'évaluation.",
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
  province: ProvinceCible | "",
  admissionStatus: AdmissionStatus | ""
): string[] {
  if (!niveauVise) return [];

  const focusPermis = admissionStatus === "admission_recue";
  const list: string[] = [];

  if (focusPermis) {
    list.push("Lettre d'admission officielle de l'établissement canadien");
    list.push("Passeport en cours de validité (toutes pages utiles)");
    list.push("Justificatifs financiers (couvrant frais + vie courante)");
    if (province === "quebec") {
      list.push(
        "CAQ (Certificat d'acceptation du Québec) — montage du dossier"
      );
    } else {
      list.push("Attestation provinciale d'études (PAL) le cas échéant");
    }
    list.push("Permis d'études IRCC — montage du dossier complet");
    list.push("Biométrie à Yaoundé — prise de rendez-vous");
    list.push("Examen médical par un médecin agréé IRCC");
    list.push("Préparation au départ (logement, billet, assurance)");
    return list;
  }

  // Admission non encore reçue → focus dossier d'admission
  list.push("Passeport en cours de validité (toutes pages utiles)");
  list.push("Diplômes obtenus (originaux ou copies certifiées conformes)");
  list.push("Relevés de notes complets de votre dernier cycle d'études");
  list.push("CV académique structuré aux standards canadiens");
  list.push("Lettre de motivation rédigée par programme cible");

  if (
    niveauVise === "licence_bachelor" ||
    niveauVise === "master_maitrise" ||
    niveauVise === "doctorat"
  ) {
    list.push("2 à 3 lettres de recommandation académiques ou professionnelles");
  }

  if (niveauVise === "doctorat") {
    list.push("Projet de recherche détaillé");
    list.push(
      "Lettre d'acceptation préliminaire d'un directeur de recherche"
    );
  }

  list.push("Justificatifs financiers (à produire avant la demande de permis)");

  if (province === "quebec") {
    list.push("Anticipation du CAQ (Certificat d'acceptation du Québec)");
  } else {
    list.push("Anticipation de l'attestation provinciale d'études (PAL)");
  }

  list.push("Préparation au permis d'études IRCC + biométrie à Yaoundé");

  return list;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  calendrier: Calendrier | "",
  niveauVise: NiveauVise | "",
  admissionStatus: AdmissionStatus | ""
): string | null {
  if (!calendrier || !niveauVise) return null;

  const focusPermis = admissionStatus === "admission_recue";

  if (focusPermis) {
    if (calendrier === "moins_3_mois") {
      return "Permis d'études IRCC — délai très serré, traitement prioritaire requis";
    }
    if (calendrier === "3_6_mois") {
      return "Permis d'études IRCC — délai juste, montage du dossier sans retard";
    }
    return "Permis d'études IRCC — délai confortable, dossier monté sereinement";
  }

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
    return "Calendrier confortable — temps suffisant pour une stratégie d'établissement multiple et la préparation linguistique";
  }

  return null;
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const ETUDES_FORM_STORAGE_KEY = "nexus_etudes_draft_v1";
