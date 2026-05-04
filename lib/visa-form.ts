// ============================================================================
// VISA FORM — Source unique de vérité
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

export type ProfilPro =
  | "etudiant"
  | "salarie_public"
  | "salarie_prive"
  | "independant"
  | "commercant"
  | "retraite"
  | "autre";

export type TrancheAge = "18_25" | "26_35" | "36_50" | "50_plus";

export type TypeVisa =
  | "tourisme"
  | "etudes"
  | "travail"
  | "business"
  | "famille"
  | "transit"
  | "autre";

export type DureeSejour = "court" | "moyen" | "long";

export type Refus = "aucun" | "1" | "2" | "3_plus";

export type Voyages = "aucun" | "1_2" | "3_5" | "6_plus";

export type RessourcesRange =
  | "moins_500k"
  | "500k_1m"
  | "1m_3m"
  | "3m_plus"
  | "non_precise";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface VisaFormData {
  // Étape 1
  nom_complet: string;
  email: string;
  telephone: string;
  pays_residence: PaysResidence | "";
  profil_pro: ProfilPro | "";
  tranche_age: TrancheAge | "";

  // Étape 2
  pays_destination: string;
  type_visa: TypeVisa | "";
  date_voyage: string;
  duree_sejour: DureeSejour | "";
  premiere_fois_pays: "" | "oui" | "non";

  // Étape 3
  visa_obtenu_avant: "" | "non" | "oui_expire" | "oui_valide";
  nb_refus: Refus | "";
  motif_refus: string;
  voyages_internationaux: Voyages | "";

  // Étape 4
  ressources_range: RessourcesRange | "";
  ancrage_rca: string;
  documents_disponibles: string[];
  invitation_admission: "" | "oui" | "non";
  invitation_admission_detail: string;

  // Étape 5
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<Record<keyof VisaFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_VISA_FORM: VisaFormData = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays_residence: "",
  profil_pro: "",
  tranche_age: "",

  pays_destination: "",
  type_visa: "",
  date_voyage: "",
  duree_sejour: "",
  premiere_fois_pays: "",

  visa_obtenu_avant: "",
  nb_refus: "",
  motif_refus: "",
  voyages_internationaux: "",

  ressources_range: "",
  ancrage_rca: "",
  documents_disponibles: [],
  invitation_admission: "",
  invitation_admission_detail: "",

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

export const PROFILS_PRO: { value: ProfilPro; label: string }[] = [
  { value: "etudiant", label: "Étudiant(e)" },
  { value: "salarie_public", label: "Salarié(e) — secteur public" },
  { value: "salarie_prive", label: "Salarié(e) — secteur privé" },
  { value: "independant", label: "Indépendant(e) / profession libérale" },
  { value: "commercant", label: "Commerçant(e) / entrepreneur(e)" },
  { value: "retraite", label: "Retraité(e)" },
  { value: "autre", label: "Autre" },
];

export const TRANCHES_AGE: { value: TrancheAge; label: string }[] = [
  { value: "18_25", label: "18 – 25 ans" },
  { value: "26_35", label: "26 – 35 ans" },
  { value: "36_50", label: "36 – 50 ans" },
  { value: "50_plus", label: "50 ans et plus" },
];

export interface DestinationOption {
  value: string;
  label: string;
  emoji: string;
  hasEVisa: boolean;
  region: "asie" | "moyen_orient" | "europe_amerique" | "afrique";
  /** Si true, biométrie obligatoire à Yaoundé/Douala */
  requiresBiometrieYaounde?: boolean;
}

export const DESTINATIONS: DestinationOption[] = [
  { value: "inde", label: "Inde", emoji: "🇮🇳", hasEVisa: true, region: "asie" },
  {
    value: "indonesie",
    label: "Indonésie (Bali)",
    emoji: "🇮🇩",
    hasEVisa: true,
    region: "asie",
  },
  {
    value: "vietnam",
    label: "Vietnam",
    emoji: "🇻🇳",
    hasEVisa: true,
    region: "asie",
  },
  {
    value: "thailande",
    label: "Thaïlande",
    emoji: "🇹🇭",
    hasEVisa: true,
    region: "asie",
  },
  {
    value: "sri_lanka",
    label: "Sri Lanka",
    emoji: "🇱🇰",
    hasEVisa: true,
    region: "asie",
  },
  {
    value: "chine",
    label: "Chine",
    emoji: "🇨🇳",
    hasEVisa: false,
    region: "asie",
  },
  {
    value: "eau",
    label: "Émirats Arabes Unis (Dubaï)",
    emoji: "🇦🇪",
    hasEVisa: true,
    region: "moyen_orient",
  },
  {
    value: "turquie",
    label: "Turquie",
    emoji: "🇹🇷",
    hasEVisa: true,
    region: "moyen_orient",
  },
  {
    value: "schengen",
    label: "Espace Schengen (26 pays)",
    emoji: "🇪🇺",
    hasEVisa: false,
    region: "europe_amerique",
    requiresBiometrieYaounde: true,
  },
  {
    value: "canada",
    label: "Canada",
    emoji: "🇨🇦",
    hasEVisa: false,
    region: "europe_amerique",
    requiresBiometrieYaounde: true,
  },
  {
    value: "maroc",
    label: "Maroc",
    emoji: "🇲🇦",
    hasEVisa: true,
    region: "afrique",
  },
  {
    value: "kenya",
    label: "Kenya",
    emoji: "🇰🇪",
    hasEVisa: true,
    region: "afrique",
  },
  {
    value: "rwanda",
    label: "Rwanda",
    emoji: "🇷🇼",
    hasEVisa: true,
    region: "afrique",
  },
  { value: "autre", label: "Autre destination", emoji: "🌍", hasEVisa: false, region: "afrique" },
];

export const TYPES_VISA_OPTIONS: {
  value: TypeVisa;
  label: string;
  description: string;
}[] = [
  {
    value: "tourisme",
    label: "Tourisme",
    description: "Voyage de loisirs, court ou moyen séjour.",
  },
  {
    value: "etudes",
    label: "Études",
    description: "Inscription dans un établissement à l'étranger.",
  },
  {
    value: "travail",
    label: "Travail",
    description: "Permis de travail, mobilité professionnelle.",
  },
  {
    value: "business",
    label: "Business",
    description: "Voyages d'affaires, salons, missions courtes.",
  },
  {
    value: "famille",
    label: "Famille",
    description: "Visite ou regroupement familial.",
  },
  {
    value: "transit",
    label: "Transit",
    description: "Passage par un pays vers une destination finale.",
  },
  { value: "autre", label: "Autre", description: "Précisez dans les détails." },
];

export const DUREES: { value: DureeSejour; label: string }[] = [
  { value: "court", label: "Court — moins de 30 jours" },
  { value: "moyen", label: "Moyen — 1 à 3 mois" },
  { value: "long", label: "Long — plus de 3 mois" },
];

export const REFUS_OPTIONS: { value: Refus; label: string }[] = [
  { value: "aucun", label: "Aucun refus" },
  { value: "1", label: "1 refus" },
  { value: "2", label: "2 refus" },
  { value: "3_plus", label: "3 refus ou plus" },
];

export const VOYAGES_OPTIONS: { value: Voyages; label: string }[] = [
  { value: "aucun", label: "Aucun voyage international" },
  { value: "1_2", label: "1 à 2 pays" },
  { value: "3_5", label: "3 à 5 pays" },
  { value: "6_plus", label: "6 pays ou plus" },
];

export const RESSOURCES_OPTIONS: {
  value: RessourcesRange;
  label: string;
}[] = [
  { value: "moins_500k", label: "Moins de 500 000 FCFA / mois" },
  { value: "500k_1m", label: "500 000 à 1 000 000 FCFA / mois" },
  { value: "1m_3m", label: "1 à 3 millions FCFA / mois" },
  { value: "3m_plus", label: "Plus de 3 millions FCFA / mois" },
  { value: "non_precise", label: "Préfère ne pas préciser" },
];

export const DOCUMENTS_OPTIONS: { value: string; label: string }[] = [
  { value: "passeport", label: "Passeport en cours de validité" },
  { value: "photos", label: "Photos d'identité aux normes" },
  { value: "domicile", label: "Justificatif de domicile" },
  { value: "ressources", label: "Justificatifs financiers / relevés" },
  { value: "invitation", label: "Lettre d'invitation" },
  { value: "admission", label: "Lettre d'admission (études)" },
  { value: "contrat", label: "Contrat de travail / mission" },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function getDestination(value: string): DestinationOption | undefined {
  return DESTINATIONS.find((d) => d.value === value);
}

export function getTypeVisa(
  value: TypeVisa | ""
): { value: TypeVisa; label: string; description: string } | undefined {
  if (!value) return undefined;
  return TYPES_VISA_OPTIONS.find((t) => t.value === value);
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: VisaFormData
): ValidationErrors {
  const e: ValidationErrors = {};

  if (step === 1) {
    if (!form.nom_complet.trim() || form.nom_complet.trim().length < 3)
      e.nom_complet = "Nom complet requis (3 caractères minimum)";
    if (!form.email.trim()) e.email = "E-mail requis";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "Format e-mail invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.pays_residence) e.pays_residence = "Pays de résidence requis";
    if (!form.profil_pro) e.profil_pro = "Profil professionnel requis";
    if (!form.tranche_age) e.tranche_age = "Tranche d'âge requise";
  }

  if (step === 2) {
    if (!form.pays_destination)
      e.pays_destination = "Destination requise";
    if (!form.type_visa) e.type_visa = "Type de visa requis";
    if (!form.duree_sejour) e.duree_sejour = "Durée prévue requise";
    if (!form.premiere_fois_pays)
      e.premiere_fois_pays = "Merci de répondre à cette question";
  }

  if (step === 3) {
    if (!form.visa_obtenu_avant)
      e.visa_obtenu_avant = "Merci de répondre à cette question";
    if (!form.nb_refus) e.nb_refus = "Merci de répondre à cette question";
    if (!form.voyages_internationaux)
      e.voyages_internationaux = "Merci de répondre à cette question";
  }

  if (step === 4) {
    if (!form.ressources_range)
      e.ressources_range = "Merci de sélectionner une fourchette";
    if (!form.ancrage_rca.trim() || form.ancrage_rca.trim().length < 10)
      e.ancrage_rca =
        "Précisez votre lien avec la RCA (10 caractères minimum)";
    if (!form.invitation_admission)
      e.invitation_admission = "Merci de répondre à cette question";
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

/**
 * Détermine si le dossier nécessite une analyse senior.
 * Soft pre-qualification : l'envoi reste possible, mais le dossier
 * est flaggé en base et le conseiller approprié reprend contact.
 */
export function requiresSeniorAnalysis(form: VisaFormData): boolean {
  if (form.nb_refus === "3_plus") return true;
  if (form.motif_refus.toLowerCase().includes("fraude")) return true;
  if (form.motif_refus.toLowerCase().includes("falsif")) return true;
  // Départ sous 10 jours pour Schengen ou Canada
  if (form.date_voyage && form.pays_destination) {
    const today = new Date();
    const departure = new Date(form.date_voyage);
    const diffDays = Math.ceil(
      (departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (
      diffDays < 10 &&
      (form.pays_destination === "schengen" ||
        form.pays_destination === "canada")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Estimation de faisabilité préliminaire.
 * Règles simples côté client — affichées au client mais validées
 * ensuite par le conseiller Nexus.
 */
export function computeFaisabilite(form: VisaFormData): Faisabilite {
  // À étudier en priorité
  if (requiresSeniorAnalysis(form)) return "a_etudier";
  if (form.nb_refus === "2") return "a_etudier";
  if (
    form.voyages_internationaux === "aucun" &&
    (form.pays_destination === "schengen" || form.pays_destination === "canada")
  ) {
    return "a_etudier";
  }

  // Faisabilité haute
  if (form.visa_obtenu_avant === "oui_valide") return "haute";
  if (
    form.visa_obtenu_avant === "oui_expire" &&
    (form.voyages_internationaux === "3_5" ||
      form.voyages_internationaux === "6_plus")
  ) {
    return "haute";
  }
  if (
    form.voyages_internationaux === "6_plus" &&
    form.nb_refus === "aucun" &&
    (form.ressources_range === "1m_3m" || form.ressources_range === "3m_plus")
  ) {
    return "haute";
  }

  // Sinon faisabilité moyenne
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
          "Votre profil présente des éléments favorables. Sous réserve de l'analyse complète par notre conseiller, ce dossier a de bonnes chances de passer.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre profil est cohérent. La présentation et la complétude du dossier seront déterminantes. Notre conseiller affinera l'évaluation.",
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

const CHECKLIST_BASE: Record<TypeVisa, string[]> = {
  tourisme: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Justificatif de domicile",
    "Justificatifs financiers (3-6 derniers mois)",
    "Réservation d'hôtel ou attestation d'hébergement",
    "Itinéraire de voyage",
  ],
  etudes: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Lettre d'admission de l'établissement",
    "Diplômes et relevés de notes",
    "Justificatifs financiers couvrant la durée des études",
    "Preuve de niveau linguistique (si requise)",
    "CV académique",
  ],
  travail: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Contrat ou offre de travail",
    "Diplômes et relevés de notes",
    "CV professionnel",
    "Justificatifs d'expérience (si applicable)",
  ],
  business: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Lettre d'invitation de l'entreprise hôte",
    "Documents de votre entreprise (registre, statut)",
    "Justificatifs financiers de l'entreprise",
    "Itinéraire et programme du voyage",
  ],
  famille: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Lettre d'invitation du proche",
    "Pièce d'identité de l'invitant",
    "Justificatif de lien familial (acte de naissance, mariage)",
    "Attestation d'hébergement",
  ],
  transit: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Visa du pays de destination finale",
    "Billet d'avion confirmant le transit",
  ],
  autre: [
    "Passeport (toutes pages utiles)",
    "Photos d'identité aux normes",
    "Documents pertinents selon le motif du voyage",
  ],
};

export function generateChecklist(
  type: TypeVisa | "",
  destination: string
): string[] {
  if (!type) return [];
  const base = CHECKLIST_BASE[type];
  const dest = getDestination(destination);

  if (dest?.requiresBiometrieYaounde) {
    return [...base, "Empreintes biométriques (à effectuer à Yaoundé)"];
  }
  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  type: TypeVisa | "",
  destination: string
): string | null {
  if (!type || !destination) return null;
  const dest = getDestination(destination);
  if (!dest) return null;

  if (dest.hasEVisa && type === "tourisme")
    return "48 h à 5 jours ouvrés (e-Visa)";
  if (dest.hasEVisa && type === "business")
    return "48 h à 7 jours ouvrés (e-Visa)";
  if (destination === "schengen" && type === "tourisme")
    return "15 à 30 jours après dépôt biométrique";
  if (destination === "schengen" && type === "etudes")
    return "30 à 60 jours après dépôt biométrique";
  if (destination === "canada" && type === "tourisme")
    return "20 à 45 jours après dépôt biométrique";
  if (destination === "canada" && type === "etudes")
    return "60 à 90 jours après dépôt biométrique";
  if (destination === "canada" && type === "travail")
    return "60 à 120 jours après dépôt biométrique";

  return "Délai à confirmer après analyse de votre dossier";
}

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function profilProLabel(p: ProfilPro | ""): string {
  return PROFILS_PRO.find((x) => x.value === p)?.label || "—";
}

export function trancheAgeLabel(t: TrancheAge | ""): string {
  return TRANCHES_AGE.find((x) => x.value === t)?.label || "—";
}

export function dureeLabel(d: DureeSejour | ""): string {
  return DUREES.find((x) => x.value === d)?.label || "—";
}

export function ressourcesLabel(r: RessourcesRange | ""): string {
  return RESSOURCES_OPTIONS.find((x) => x.value === r)?.label || "—";
}

export function refusLabel(r: Refus | ""): string {
  return REFUS_OPTIONS.find((x) => x.value === r)?.label || "—";
}

export function voyagesLabel(v: Voyages | ""): string {
  return VOYAGES_OPTIONS.find((x) => x.value === v)?.label || "—";
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const VISA_FORM_STORAGE_KEY = "nexus_visa_draft_v1";
