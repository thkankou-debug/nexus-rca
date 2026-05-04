// ============================================================================
// TCF FORM — Source unique de vérité
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

export type ProjetCible =
  | "entree_express"
  | "peq_quebec"
  | "mobilite_francophone"
  | "etudes"
  | "regroupement_familial"
  | "autre";

export type ScoreCible =
  | "nclc_4_6"
  | "nclc_7"
  | "nclc_8"
  | "nclc_9_10"
  | "non_defini";

export type NiveauDeclare =
  | "debutant"
  | "intermediaire_a2_b1"
  | "courant_b2_c1"
  | "avance_c1_c2"
  | "natif";

export type DerniereScolarite =
  | "ecole_primaire"
  | "secondaire"
  | "superieur_2_ans"
  | "licence"
  | "master_plus";

export type ExperienceTcf = "jamais" | "passe_recent" | "passe_ancien";

export type ScoreAnterieur =
  | "ne_sais_pas"
  | "moins_300"
  | "300_400"
  | "400_500"
  | "500_600"
  | "600_plus";

export type Format = "groupe" | "individuel" | "indifferent";
export type Modalite = "presentiel" | "distance" | "hybride";

export type Calendrier =
  | "moins_4_semaines"
  | "4_8_semaines"
  | "8_16_semaines"
  | "plus_16_semaines";

export type Disponibilite =
  | "moins_3h"
  | "3_5h"
  | "5_10h"
  | "plus_10h";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface TcfFormData {
  // Étape 1 — Profil
  nom_complet: string;
  email: string;
  telephone: string;
  pays_residence: PaysResidence | "";
  derniere_scolarite: DerniereScolarite | "";

  // Étape 2 — Projet
  projet_cible: ProjetCible | "";
  score_cible: ScoreCible | "";
  calendrier: Calendrier | "";
  date_test_souhaitee: string;

  // Étape 3 — Niveau & expérience
  niveau_declare: NiveauDeclare | "";
  experience_tcf: ExperienceTcf | "";
  score_anterieur: ScoreAnterieur | "";
  point_faible_oral: boolean;
  point_faible_ecrit: boolean;
  point_faible_comprehension: boolean;

  // Étape 4 — Préférences
  format: Format | "";
  modalite: Modalite | "";
  disponibilite: Disponibilite | "";
  contraintes: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<Record<keyof TcfFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_TCF_FORM: TcfFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays_residence: "",
  derniere_scolarite: "",

  projet_cible: "",
  score_cible: "",
  calendrier: "",
  date_test_souhaitee: "",

  niveau_declare: "",
  experience_tcf: "",
  score_anterieur: "",
  point_faible_oral: false,
  point_faible_ecrit: false,
  point_faible_comprehension: false,

  format: "",
  modalite: "",
  disponibilite: "",
  contraintes: "",

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

export const PROJETS_CIBLES: { value: ProjetCible; label: string }[] = [
  { value: "entree_express", label: "Entrée express (immigration économique)" },
  { value: "peq_quebec", label: "PEQ Québec / immigration provinciale" },
  { value: "mobilite_francophone", label: "Mobilité francophone (permis de travail)" },
  { value: "etudes", label: "Admission études au Canada" },
  { value: "regroupement_familial", label: "Regroupement familial" },
  { value: "autre", label: "Autre projet" },
];

export const SCORES_CIBLES: { value: ScoreCible; label: string }[] = [
  { value: "nclc_4_6", label: "NCLC 4–6 (B1)" },
  { value: "nclc_7", label: "NCLC 7 (B2) — pivot Entrée express" },
  { value: "nclc_8", label: "NCLC 8 (B2 fort)" },
  { value: "nclc_9_10", label: "NCLC 9–10 (C1+) — bonus maximal" },
  { value: "non_defini", label: "Pas encore défini" },
];

export const NIVEAUX_DECLARES: { value: NiveauDeclare; label: string }[] = [
  { value: "debutant", label: "Débutant — je commence" },
  { value: "intermediaire_a2_b1", label: "Intermédiaire (A2–B1)" },
  { value: "courant_b2_c1", label: "Courant (B2–C1)" },
  { value: "avance_c1_c2", label: "Avancé (C1–C2)" },
  { value: "natif", label: "Francophone natif" },
];

export const DERNIERES_SCOLARITES: {
  value: DerniereScolarite;
  label: string;
}[] = [
  { value: "ecole_primaire", label: "Primaire" },
  { value: "secondaire", label: "Secondaire (BEPC/Bac)" },
  { value: "superieur_2_ans", label: "Supérieur 2 ans (BTS/DUT)" },
  { value: "licence", label: "Licence / Bachelor" },
  { value: "master_plus", label: "Master ou plus" },
];

export const EXPERIENCES_TCF: { value: ExperienceTcf; label: string }[] = [
  { value: "jamais", label: "Jamais passé le TCF Canada" },
  { value: "passe_recent", label: "Déjà passé (moins de 2 ans)" },
  { value: "passe_ancien", label: "Déjà passé (plus de 2 ans)" },
];

export const SCORES_ANTERIEURS: { value: ScoreAnterieur; label: string }[] = [
  { value: "ne_sais_pas", label: "Je ne me souviens pas" },
  { value: "moins_300", label: "Moins de 300 / 699" },
  { value: "300_400", label: "300 – 400" },
  { value: "400_500", label: "400 – 500" },
  { value: "500_600", label: "500 – 600" },
  { value: "600_plus", label: "Plus de 600" },
];

export const FORMATS: { value: Format; label: string }[] = [
  { value: "groupe", label: "Groupe (plus économique)" },
  { value: "individuel", label: "Individuel (plus intensif)" },
  { value: "indifferent", label: "Indifférent — laissez-moi conseiller" },
];

export const MODALITES: { value: Modalite; label: string }[] = [
  { value: "presentiel", label: "Présentiel à Bangui" },
  { value: "distance", label: "À distance (visio)" },
  { value: "hybride", label: "Hybride (mixte)" },
];

export const CALENDRIERS: { value: Calendrier; label: string }[] = [
  { value: "moins_4_semaines", label: "Moins de 4 semaines (très intensif)" },
  { value: "4_8_semaines", label: "4 à 8 semaines (intensif)" },
  { value: "8_16_semaines", label: "8 à 16 semaines (standard)" },
  { value: "plus_16_semaines", label: "Plus de 16 semaines (long parcours)" },
];

export const DISPONIBILITES: { value: Disponibilite; label: string }[] = [
  { value: "moins_3h", label: "Moins de 3 h / semaine" },
  { value: "3_5h", label: "3 à 5 h / semaine" },
  { value: "5_10h", label: "5 à 10 h / semaine" },
  { value: "plus_10h", label: "Plus de 10 h / semaine" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function projetCibleLabel(p: ProjetCible | ""): string {
  return PROJETS_CIBLES.find((x) => x.value === p)?.label || "—";
}
export function scoreCibleLabel(s: ScoreCible | ""): string {
  return SCORES_CIBLES.find((x) => x.value === s)?.label || "—";
}
export function niveauDeclareLabel(n: NiveauDeclare | ""): string {
  return NIVEAUX_DECLARES.find((x) => x.value === n)?.label || "—";
}
export function derniereScolariteLabel(d: DerniereScolarite | ""): string {
  return DERNIERES_SCOLARITES.find((x) => x.value === d)?.label || "—";
}
export function experienceTcfLabel(e: ExperienceTcf | ""): string {
  return EXPERIENCES_TCF.find((x) => x.value === e)?.label || "—";
}
export function scoreAnterieurLabel(s: ScoreAnterieur | ""): string {
  return SCORES_ANTERIEURS.find((x) => x.value === s)?.label || "—";
}
export function formatLabel(f: Format | ""): string {
  return FORMATS.find((x) => x.value === f)?.label || "—";
}
export function modaliteLabel(m: Modalite | ""): string {
  return MODALITES.find((x) => x.value === m)?.label || "—";
}
export function calendrierLabel(c: Calendrier | ""): string {
  return CALENDRIERS.find((x) => x.value === c)?.label || "—";
}
export function disponibiliteLabel(d: Disponibilite | ""): string {
  return DISPONIBILITES.find((x) => x.value === d)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: TcfFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.pays_residence) e.pays_residence = "Pays de résidence requis";
    if (!form.derniere_scolarite)
      e.derniere_scolarite = "Niveau scolaire requis";
  }

  if (step === 2) {
    if (!form.projet_cible) e.projet_cible = "Projet cible requis";
    if (!form.score_cible) e.score_cible = "Score cible requis";
    if (!form.calendrier) e.calendrier = "Calendrier requis";
  }

  if (step === 3) {
    if (!form.niveau_declare) e.niveau_declare = "Niveau déclaré requis";
    if (!form.experience_tcf)
      e.experience_tcf = "Expérience TCF antérieure requise";
    if (
      (form.experience_tcf === "passe_recent" ||
        form.experience_tcf === "passe_ancien") &&
      !form.score_anterieur
    ) {
      e.score_anterieur = "Score précédent requis";
    }
  }

  if (step === 4) {
    if (!form.format) e.format = "Format souhaité requis";
    if (!form.modalite) e.modalite = "Modalité requise";
    if (!form.disponibilite) e.disponibilite = "Disponibilité requise";
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

export function requiresSeniorAnalysis(form: TcfFormData): boolean {
  // Niveau débutant + score visé élevé + délai court
  if (
    form.niveau_declare === "debutant" &&
    (form.score_cible === "nclc_8" || form.score_cible === "nclc_9_10") &&
    (form.calendrier === "moins_4_semaines" ||
      form.calendrier === "4_8_semaines")
  ) {
    return true;
  }
  // Score antérieur faible + viser haut + délai serré
  if (
    (form.score_anterieur === "moins_300" ||
      form.score_anterieur === "300_400") &&
    (form.score_cible === "nclc_8" || form.score_cible === "nclc_9_10") &&
    form.calendrier === "moins_4_semaines"
  ) {
    return true;
  }
  // Disponibilité très faible avec score élevé visé
  if (
    form.disponibilite === "moins_3h" &&
    (form.score_cible === "nclc_8" || form.score_cible === "nclc_9_10")
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: TcfFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Faisabilité haute
  if (
    (form.niveau_declare === "courant_b2_c1" ||
      form.niveau_declare === "avance_c1_c2" ||
      form.niveau_declare === "natif") &&
    (form.calendrier === "8_16_semaines" ||
      form.calendrier === "plus_16_semaines") &&
    (form.disponibilite === "5_10h" || form.disponibilite === "plus_10h")
  ) {
    return "haute";
  }
  if (
    form.niveau_declare === "natif" &&
    (form.score_cible === "nclc_4_6" || form.score_cible === "nclc_7")
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
          "Votre niveau et votre disponibilité sont très favorables au score visé. Sous réserve du test de positionnement, le plan d'entraînement sera court et ciblé.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre profil est cohérent avec le score visé. La régularité et l'engagement seront déterminants. Notre coach ajustera le plan après le test de positionnement.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Le score visé dans votre délai exige une analyse approfondie par un coach senior avant tout engagement. Nous vous contacterons sous 48 heures ouvrées.",
      };
  }
}

// ─── CHECKLIST DOCUMENTS ────────────────────────────────────────────────────

export function generateChecklist(
  experience: ExperienceTcf | "",
  format: Format | ""
): string[] {
  const base = [
    "Pièce d'identité en cours de validité",
    "Adresse e-mail active pour la plateforme d'entraînement",
    "Disponibilité régulière confirmée (sessions hebdomadaires)",
  ];

  if (experience === "passe_recent" || experience === "passe_ancien") {
    base.push("Relevé de score TCF antérieur (si disponible)");
  }

  if (format === "groupe") {
    base.push("Souplesse horaire pour s'aligner sur le calendrier de groupe");
  }

  base.push("Engagement à effectuer les exercices entre les sessions");

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  niveau: NiveauDeclare | "",
  scoreCible: ScoreCible | "",
  disponibilite: Disponibilite | ""
): string | null {
  if (!niveau || !scoreCible) return null;

  const intensif =
    disponibilite === "5_10h" || disponibilite === "plus_10h";

  if (
    (niveau === "courant_b2_c1" ||
      niveau === "avance_c1_c2" ||
      niveau === "natif") &&
    (scoreCible === "nclc_4_6" || scoreCible === "nclc_7")
  ) {
    return intensif
      ? "Préparation rapide : 3 à 5 semaines"
      : "Préparation standard : 6 à 8 semaines";
  }

  if (scoreCible === "nclc_9_10") {
    return intensif
      ? "Préparation exigeante : 8 à 12 semaines"
      : "Préparation longue : 12 à 16 semaines";
  }

  if (niveau === "debutant" || niveau === "intermediaire_a2_b1") {
    return "Mise à niveau préalable requise + préparation : 12 à 20 semaines";
  }

  return "Préparation standard : 8 à 12 semaines";
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const TCF_FORM_STORAGE_KEY = "nexus_tcf_draft_v1";
