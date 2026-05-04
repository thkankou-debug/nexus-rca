// ============================================================================
// BILLETS FORM — Source unique de vérité
// Vols + hôtels : types, options, validation, génération auto.
// ============================================================================

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Prestation = "vol_seul" | "hotel_seul" | "vol_hotel";

export type TypeVol = "aller_simple" | "aller_retour" | "multi_villes";

export type Classe =
  | "economique"
  | "premium_economy"
  | "business"
  | "premiere"
  | "indifferent";

export type FlexibiliteDates =
  | "dates_fixes"
  | "plus_moins_2j"
  | "plus_moins_7j"
  | "tres_flexible";

export type CategorieHotel =
  | "economique"
  | "milieu_gamme"
  | "haut_gamme"
  | "luxe"
  | "indifferent";

export type ZoneHotel =
  | "centre_ville"
  | "quartier_affaires"
  | "proche_aeroport"
  | "balneaire"
  | "indifferent";

export type Compagnie =
  | "air_france"
  | "royal_air_maroc"
  | "ethiopian"
  | "asky"
  | "kenya_airways"
  | "turkish"
  | "indifferent";

export type Budget =
  | "moins_500k"
  | "500k_1m"
  | "1m_2m"
  | "2m_5m"
  | "5m_plus"
  | "ouvert";

export type Urgence =
  | "moins_72h"
  | "cette_semaine"
  | "ce_mois"
  | "plus_d_un_mois";

export type MotifVoyage =
  | "tourisme"
  | "famille"
  | "affaires"
  | "etudes"
  | "sante_medical"
  | "religieux"
  | "autre";

export type Faisabilite = "haute" | "moyenne" | "a_etudier";

export interface Voyageur {
  prenom: string;
  nom: string;
  adulte: boolean; // true = adulte, false = enfant
}

export interface BilletsFormData {
  // Étape 1 — Demandeur
  nom_complet: string;
  email: string;
  telephone: string;

  // Étape 2 — Type de prestation
  prestation: Prestation | "";
  motif: MotifVoyage | "";
  urgence: Urgence | "";

  // Étape 3 — Vol (si applicable)
  type_vol: TypeVol | "";
  ville_depart: string;
  ville_arrivee: string;
  villes_etapes: string;
  date_depart: string;
  date_retour: string;
  flexibilite: FlexibiliteDates | "";
  classe: Classe | "";
  compagnie_pref: Compagnie | "";
  nb_adultes: number;
  nb_enfants: number;

  // Étape 4 — Hôtel + budget (si applicable)
  date_arrivee_hotel: string;
  date_depart_hotel: string;
  categorie_hotel: CategorieHotel | "";
  zone_hotel: ZoneHotel | "";
  nb_chambres: number;
  budget: Budget | "";
  precisions: string;

  // Étape 5 — Synthèse
  consentement_examen: boolean;
  consentement_traitement: boolean;
}

export type ValidationErrors = Partial<Record<keyof BilletsFormData, string>>;

// ─── DÉFAUTS ────────────────────────────────────────────────────────────────

export const DEFAULT_BILLETS_FORM: BilletsFormData = {
  nom_complet: "",
  email: "",
  telephone: "",

  prestation: "",
  motif: "",
  urgence: "",

  type_vol: "",
  ville_depart: "Bangui",
  ville_arrivee: "",
  villes_etapes: "",
  date_depart: "",
  date_retour: "",
  flexibilite: "",
  classe: "",
  compagnie_pref: "",
  nb_adultes: 1,
  nb_enfants: 0,

  date_arrivee_hotel: "",
  date_depart_hotel: "",
  categorie_hotel: "",
  zone_hotel: "",
  nb_chambres: 1,
  budget: "",
  precisions: "",

  consentement_examen: false,
  consentement_traitement: false,
};

// ─── OPTIONS UI ─────────────────────────────────────────────────────────────

export const PRESTATIONS: { value: Prestation; label: string }[] = [
  { value: "vol_seul", label: "Vol uniquement" },
  { value: "hotel_seul", label: "Hôtel uniquement" },
  { value: "vol_hotel", label: "Vol + hôtel (combiné)" },
];

export const TYPES_VOL: { value: TypeVol; label: string }[] = [
  { value: "aller_simple", label: "Aller simple" },
  { value: "aller_retour", label: "Aller-retour" },
  { value: "multi_villes", label: "Multi-destinations" },
];

export const CLASSES: { value: Classe; label: string }[] = [
  { value: "economique", label: "Économique" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "premiere", label: "Première" },
  { value: "indifferent", label: "Indifférent — laissez-moi conseiller" },
];

export const FLEXIBILITES: { value: FlexibiliteDates; label: string }[] = [
  { value: "dates_fixes", label: "Dates fixes — pas de flexibilité" },
  { value: "plus_moins_2j", label: "± 2 jours autour des dates" },
  { value: "plus_moins_7j", label: "± 7 jours autour des dates" },
  { value: "tres_flexible", label: "Très flexible — meilleur tarif" },
];

export const CATEGORIES_HOTEL: { value: CategorieHotel; label: string }[] = [
  { value: "economique", label: "Économique (2★)" },
  { value: "milieu_gamme", label: "Milieu de gamme (3★)" },
  { value: "haut_gamme", label: "Haut de gamme (4★)" },
  { value: "luxe", label: "Luxe (5★)" },
  { value: "indifferent", label: "Indifférent — selon budget" },
];

export const ZONES_HOTEL: { value: ZoneHotel; label: string }[] = [
  { value: "centre_ville", label: "Centre-ville" },
  { value: "quartier_affaires", label: "Quartier d'affaires" },
  { value: "proche_aeroport", label: "Proche aéroport" },
  { value: "balneaire", label: "Balnéaire / touristique" },
  { value: "indifferent", label: "Indifférent" },
];

export const COMPAGNIES: { value: Compagnie; label: string }[] = [
  { value: "air_france", label: "Air France" },
  { value: "royal_air_maroc", label: "Royal Air Maroc" },
  { value: "ethiopian", label: "Ethiopian Airlines" },
  { value: "asky", label: "ASKY" },
  { value: "kenya_airways", label: "Kenya Airways" },
  { value: "turkish", label: "Turkish Airlines" },
  { value: "indifferent", label: "Indifférent — meilleur prix" },
];

export const BUDGETS: { value: Budget; label: string }[] = [
  { value: "moins_500k", label: "Moins de 500 000 FCFA" },
  { value: "500k_1m", label: "500 000 à 1 million FCFA" },
  { value: "1m_2m", label: "1 à 2 millions FCFA" },
  { value: "2m_5m", label: "2 à 5 millions FCFA" },
  { value: "5m_plus", label: "Plus de 5 millions FCFA" },
  { value: "ouvert", label: "Budget ouvert — j'attends les options" },
];

export const URGENCES: { value: Urgence; label: string }[] = [
  { value: "moins_72h", label: "Moins de 72 heures" },
  { value: "cette_semaine", label: "Cette semaine" },
  { value: "ce_mois", label: "Ce mois-ci" },
  { value: "plus_d_un_mois", label: "Plus d'un mois" },
];

export const MOTIFS_VOYAGE: { value: MotifVoyage; label: string }[] = [
  { value: "tourisme", label: "Tourisme / loisirs" },
  { value: "famille", label: "Famille / regroupement" },
  { value: "affaires", label: "Affaires / mission pro" },
  { value: "etudes", label: "Études" },
  { value: "sante_medical", label: "Santé / médical" },
  { value: "religieux", label: "Religieux" },
  { value: "autre", label: "Autre motif" },
];

// ─── HELPERS LIBELLÉS ───────────────────────────────────────────────────────

export function prestationLabel(p: Prestation | ""): string {
  return PRESTATIONS.find((x) => x.value === p)?.label || "—";
}
export function typeVolLabel(t: TypeVol | ""): string {
  return TYPES_VOL.find((x) => x.value === t)?.label || "—";
}
export function classeLabel(c: Classe | ""): string {
  return CLASSES.find((x) => x.value === c)?.label || "—";
}
export function flexibiliteLabel(f: FlexibiliteDates | ""): string {
  return FLEXIBILITES.find((x) => x.value === f)?.label || "—";
}
export function categorieHotelLabel(c: CategorieHotel | ""): string {
  return CATEGORIES_HOTEL.find((x) => x.value === c)?.label || "—";
}
export function zoneHotelLabel(z: ZoneHotel | ""): string {
  return ZONES_HOTEL.find((x) => x.value === z)?.label || "—";
}
export function compagnieLabel(c: Compagnie | ""): string {
  return COMPAGNIES.find((x) => x.value === c)?.label || "—";
}
export function budgetLabel(b: Budget | ""): string {
  return BUDGETS.find((x) => x.value === b)?.label || "—";
}
export function urgenceLabel(u: Urgence | ""): string {
  return URGENCES.find((x) => x.value === u)?.label || "—";
}
export function motifVoyageLabel(m: MotifVoyage | ""): string {
  return MOTIFS_VOYAGE.find((x) => x.value === m)?.label || "—";
}

// ─── VALIDATION PAR ÉTAPE ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  form: BilletsFormData
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
    if (!form.motif) e.motif = "Motif du voyage requis";
    if (!form.urgence) e.urgence = "Urgence requise";
  }

  if (step === 3) {
    if (form.prestation === "vol_seul" || form.prestation === "vol_hotel") {
      if (!form.type_vol) e.type_vol = "Type de vol requis";
      if (!form.ville_depart.trim())
        e.ville_depart = "Ville de départ requise";
      if (!form.ville_arrivee.trim())
        e.ville_arrivee = "Destination requise";
      if (!form.date_depart) e.date_depart = "Date de départ requise";
      if (form.type_vol === "aller_retour" && !form.date_retour) {
        e.date_retour = "Date de retour requise pour un aller-retour";
      }
      if (!form.flexibilite) e.flexibilite = "Flexibilité requise";
      if (!form.classe) e.classe = "Classe requise";
      if (form.nb_adultes < 1) e.nb_adultes = "Au moins un adulte requis";
    }
  }

  if (step === 4) {
    if (form.prestation === "hotel_seul" || form.prestation === "vol_hotel") {
      if (!form.date_arrivee_hotel)
        e.date_arrivee_hotel = "Date d'arrivée à l'hôtel requise";
      if (!form.date_depart_hotel)
        e.date_depart_hotel = "Date de départ de l'hôtel requise";
      if (!form.categorie_hotel)
        e.categorie_hotel = "Catégorie d'hôtel requise";
      if (form.nb_chambres < 1) e.nb_chambres = "Au moins une chambre requise";
    }
    if (!form.budget) e.budget = "Budget requis";
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

export function requiresSeniorAnalysis(form: BilletsFormData): boolean {
  // Délai très court + multi-destinations
  if (form.urgence === "moins_72h" && form.type_vol === "multi_villes") {
    return true;
  }
  // Budget faible vs prestation gourmande
  if (
    form.budget === "moins_500k" &&
    (form.prestation === "vol_hotel" || form.classe === "business" || form.classe === "premiere")
  ) {
    return true;
  }
  // Long-courrier (Canada) en moins de 72h
  if (
    form.urgence === "moins_72h" &&
    (form.ville_arrivee.toLowerCase().includes("canada") ||
      form.ville_arrivee.toLowerCase().includes("montréal") ||
      form.ville_arrivee.toLowerCase().includes("toronto"))
  ) {
    return true;
  }
  return false;
}

export function computeFaisabilite(form: BilletsFormData): Faisabilite {
  if (requiresSeniorAnalysis(form)) return "a_etudier";

  // Cas standard avec délai confortable
  if (
    (form.urgence === "ce_mois" || form.urgence === "plus_d_un_mois") &&
    form.budget !== "moins_500k"
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
          "Votre demande est dans un cadre standard avec un délai confortable. Nous proposerons 2 à 3 options sous 24 heures ouvrées.",
      };
    case "moyenne":
      return {
        label: "Faisabilité moyenne",
        color: "amber",
        emoji: "🟡",
        description:
          "Votre demande est cohérente mais nécessite une recherche fine selon délai ou budget. Le conseiller affinera les options.",
      };
    case "a_etudier":
      return {
        label: "À étudier en priorité",
        color: "rose",
        emoji: "🟠",
        description:
          "Votre situation (délai très court, budget tendu ou destination complexe) nécessite une analyse rapide par un conseiller senior. Réponse dans les heures qui suivent.",
      };
  }
}

// ─── CHECKLIST ──────────────────────────────────────────────────────────────

export function generateChecklist(form: BilletsFormData): string[] {
  const base: string[] = [];

  if (form.prestation === "vol_seul" || form.prestation === "vol_hotel") {
    base.push("Passeport valide pour chaque voyageur (validité ≥ 6 mois)");
    base.push("Visa pour la destination si exigé");
    base.push("Noms exacts des voyageurs tels qu'inscrits sur le passeport");
  }

  if (form.prestation === "hotel_seul" || form.prestation === "vol_hotel") {
    base.push("Pièce d'identité du voyageur principal pour la réservation");
  }

  if (form.nb_enfants > 0) {
    base.push("Pièces d'identité ou actes de naissance des enfants");
  }

  base.push("Capacité à valider et payer en FCFA dès accord sur l'option retenue");

  return base;
}

// ─── DÉLAI INDICATIF ────────────────────────────────────────────────────────

export function generateDelaiIndicatif(
  urgence: Urgence | "",
  prestation: Prestation | ""
): string | null {
  if (!urgence) return null;

  if (urgence === "moins_72h") {
    return "Réponse dans la journée · Recherche express, options réduites possibles";
  }
  if (urgence === "cette_semaine") {
    return "Devis sous 24 h ouvrées · Émission immédiate après validation";
  }
  if (prestation === "vol_hotel") {
    return "Devis sous 24 à 48 h ouvrées · Combinaison vol + hôtel optimisée";
  }
  return "Devis sous 24 h ouvrées · 2 à 3 options proposées";
}

// ─── STORAGE LOCAL ──────────────────────────────────────────────────────────

export const BILLETS_FORM_STORAGE_KEY = "nexus_billets_draft_v1";
