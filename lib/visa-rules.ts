// ============================================================================
// VISA RULES — Règles métier complémentaires pour les checkers publics
// ----------------------------------------------------------------------------
// Découplé volontairement de lib/visa-form.ts ET de components/visa/VisaForm.tsx
// pour que les checkers publics (VisaRequirementChecker, EVisaEligibilityChecker,
// VisaDocumentChecklist) puissent évoluer indépendamment du formulaire de
// soumission officielle.
//
// Source de vérité partagée : DESTINATIONS et TYPES_VISA_OPTIONS de visa-form.ts.
// Tout ce qui est ICI = délais indicatifs + documents par type de visa.
//
// ⚠️ Valeurs indicatives à valider/ajuster avec l'équipe métier.
// ============================================================================

import type { TypeVisa, DureeSejour } from "@/lib/visa-form";

// ─── Délais indicatifs par destination (jours ouvrés) ───────────────────────
// Range min-max d'instruction consulaire OU d'émission e-Visa.
// Valeurs basées sur la communication actuelle de la page (cf. section e-Visa
// "48 h à 5 jours") et conventions Schengen/Canada.
export interface DelaiIndicatif {
  min: number;
  max: number;
  unit: "jours";
  note?: string;
}

export const DELAIS_PAR_DESTINATION: Record<string, DelaiIndicatif> = {
  inde: { min: 3, max: 5, unit: "jours", note: "e-Visa délivré par e-mail" },
  indonesie: { min: 2, max: 5, unit: "jours" },
  vietnam: { min: 2, max: 4, unit: "jours" },
  thailande: { min: 5, max: 10, unit: "jours" },
  sri_lanka: { min: 1, max: 3, unit: "jours", note: "ETA en ligne" },
  chine: { min: 7, max: 15, unit: "jours", note: "Visa classique au consulat" },
  eau: { min: 2, max: 4, unit: "jours" },
  turquie: { min: 1, max: 3, unit: "jours" },
  schengen: {
    min: 15,
    max: 45,
    unit: "jours",
    note: "Délai consulaire variable + biométrie obligatoire à Yaoundé",
  },
  canada: {
    min: 20,
    max: 60,
    unit: "jours",
    note: "IRCC + biométrie obligatoire à Yaoundé",
  },
  maroc: { min: 5, max: 10, unit: "jours" },
  kenya: { min: 1, max: 3, unit: "jours", note: "e-Visa en ligne" },
  rwanda: { min: 1, max: 3, unit: "jours", note: "e-Visa rapide" },
  autre: { min: 5, max: 30, unit: "jours", note: "Délai à confirmer au cas par cas" },
};

export function getDelai(destination: string): DelaiIndicatif | undefined {
  return DELAIS_PAR_DESTINATION[destination];
}

// ─── Documents requis par type de visa ──────────────────────────────────────
// Liste indicative par type. Le consulat final peut exiger des pièces
// complémentaires — c'est le job du conseiller Nexus de cadrer.
export interface DocumentItem {
  label: string;
  hint?: string;
  /** true = obligatoire dans 100% des cas, false = optionnel/contextuel */
  required: boolean;
}

export const DOCUMENTS_PAR_TYPE: Record<TypeVisa, DocumentItem[]> = {
  tourisme: [
    { label: "Passeport en cours de validité (6 mois min. après retour)", required: true },
    { label: "Photos d'identité aux normes biométriques", required: true },
    { label: "Justificatif d'hébergement (réservation hôtel ou attestation)", required: true },
    { label: "Réservation aller-retour (vol confirmé)", required: true },
    { label: "Justificatifs financiers récents (3 derniers relevés)", required: true },
    { label: "Assurance voyage avec couverture médicale ≥ 30 000 EUR", required: true },
    { label: "Itinéraire détaillé du séjour", required: false },
  ],
  etudes: [
    { label: "Passeport en cours de validité", required: true },
    { label: "Lettre d'admission de l'établissement étranger", required: true },
    { label: "Justificatif financier de prise en charge (12 mois)", required: true },
    { label: "Diplômes + relevés de notes traduits", required: true },
    { label: "Lettre de motivation académique", required: true },
    { label: "Certificat de logement étudiant ou attestation hébergeur", required: true },
    { label: "Tests de langue (TCF, IELTS) si applicable", required: false },
    { label: "Assurance maladie étudiante", required: true },
  ],
  travail: [
    { label: "Passeport en cours de validité", required: true },
    { label: "Contrat de travail signé OU offre d'embauche", required: true },
    { label: "Permis de travail délivré par les autorités du pays cible", required: true },
    { label: "Diplômes + CV traduits", required: true },
    { label: "Certificats de travail antérieurs", required: true },
    { label: "Casier judiciaire vierge", required: true },
    { label: "Visite médicale agréée", required: false },
  ],
  business: [
    { label: "Passeport en cours de validité", required: true },
    { label: "Lettre d'invitation officielle (entreprise étrangère)", required: true },
    { label: "Lettre de mission de votre employeur RCA", required: true },
    { label: "Registre de commerce / statuts (si dirigeant)", required: true },
    { label: "Justificatifs financiers de l'entreprise", required: true },
    { label: "Programme de visite / agenda", required: false },
  ],
  famille: [
    { label: "Passeport en cours de validité", required: true },
    { label: "Lettre d'invitation du proche (signée + copie pièce d'identité)", required: true },
    { label: "Justificatif du lien familial (acte naissance, mariage)", required: true },
    { label: "Justificatif de prise en charge financière", required: true },
    { label: "Hébergement chez l'invitant ou hôtel", required: true },
    { label: "Assurance voyage", required: true },
  ],
  transit: [
    { label: "Passeport en cours de validité", required: true },
    { label: "Visa du pays de destination finale", required: true },
    { label: "Billet d'avion confirmé pour la destination finale", required: true },
    { label: "Réservation hôtel si escale > 24h", required: false },
  ],
  autre: [
    { label: "Passeport en cours de validité", required: true },
    {
      label: "Documents à préciser avec un conseiller Nexus selon votre cas",
      required: true,
      hint: "Soumettez votre demande pour un cadrage individuel",
    },
  ],
};

export function getDocuments(type: TypeVisa): DocumentItem[] {
  return DOCUMENTS_PAR_TYPE[type] || [];
}

// ─── Verdict pour VisaRequirementChecker ────────────────────────────────────
// Calcule un verdict synthétique à partir de (destination, type, durée).
export type CheckerVerdict = "e_visa" | "visa_classique" | "biometrie_yaounde" | "transit_simple" | "cas_complexe";

export interface CheckerResult {
  verdict: CheckerVerdict;
  title: string;
  message: string;
  delai?: DelaiIndicatif;
  biometrieYaounde: boolean;
  hasEVisa: boolean;
  recommendation: string;
}

import { getDestination } from "@/lib/visa-form";

export function computeRequirement(
  destinationValue: string,
  type: TypeVisa | "",
  duree: DureeSejour | ""
): CheckerResult | null {
  const dest = getDestination(destinationValue);
  if (!dest || !type) return null;

  const delai = getDelai(destinationValue);
  const biometrieYaounde = !!dest.requiresBiometrieYaounde;
  const hasEVisa = dest.hasEVisa;

  // ─── Cas "transit" ─────────────────────────────────────────────────────
  if (type === "transit") {
    return {
      verdict: "transit_simple",
      title: "Transit — formalité simplifiée",
      message: `Pour un transit via ${dest.label}, vous aurez généralement besoin du visa du pays de destination finale et d'un billet confirmé.`,
      delai,
      biometrieYaounde: false,
      hasEVisa: false,
      recommendation:
        "Si l'escale dure plus de 24 h ou si vous quittez la zone de transit, un visa de transit dédié peut être requis. Demandez-nous un avis.",
    };
  }

  // ─── Cas "long séjour" → toujours classique consulat ───────────────────
  if (duree === "long") {
    return {
      verdict: biometrieYaounde ? "biometrie_yaounde" : "visa_classique",
      title: biometrieYaounde
        ? "Visa long séjour + biométrie à Yaoundé"
        : "Visa classique long séjour",
      message: `Un séjour de plus de 3 mois en ${dest.label} pour ${labelType(type)} nécessite un visa long séjour au consulat.`,
      delai,
      biometrieYaounde,
      hasEVisa: false,
      recommendation:
        biometrieYaounde
          ? "Anticipez 4 à 8 semaines : prise de RDV TLS/VFS, déplacement Yaoundé pour biométrie, instruction consulaire."
          : "Anticipez 3 à 5 semaines pour un dossier complet et le traitement consulaire.",
    };
  }

  // ─── Cas e-Visa éligible (court/moyen + tourisme/business/famille) ────
  if (hasEVisa && (type === "tourisme" || type === "business" || type === "famille")) {
    return {
      verdict: "e_visa",
      title: "e-Visa éligible — 100 % en ligne",
      message: `Pour ${dest.label} en ${labelType(type)}, vous êtes éligible à l'e-Visa : aucune biométrie à Yaoundé requise.`,
      delai,
      biometrieYaounde: false,
      hasEVisa: true,
      recommendation:
        "Procédure rapide. Préparez : passeport, photo numérique, justificatifs de séjour. Nexus prend en charge la soumission.",
    };
  }

  // ─── Études → toujours classique (même si destination a e-visa) ────────
  if (type === "etudes") {
    return {
      verdict: biometrieYaounde ? "biometrie_yaounde" : "visa_classique",
      title: biometrieYaounde
        ? "Visa études + biométrie à Yaoundé"
        : "Visa études classique",
      message: `Un visa études pour ${dest.label} se traite obligatoirement au consulat (les e-Visa ne couvrent pas les études).`,
      delai,
      biometrieYaounde,
      hasEVisa: false,
      recommendation:
        "Préparez le dossier d'admission, les justificatifs financiers (12 mois) et les diplômes traduits avant le RDV consulaire.",
    };
  }

  // ─── Travail → toujours classique + souvent permis travail préalable ──
  if (type === "travail") {
    return {
      verdict: "cas_complexe",
      title: "Visa travail — cas complexe",
      message: `Un visa travail pour ${dest.label} exige généralement un permis de travail délivré par l'employeur étranger AVANT la demande de visa.`,
      delai,
      biometrieYaounde,
      hasEVisa: false,
      recommendation:
        "Soumettez votre dossier — un conseiller senior Nexus vous indiquera la marche à suivre selon votre offre d'emploi.",
    };
  }

  // ─── Cas par défaut : classique ou biométrie selon destination ────────
  return {
    verdict: biometrieYaounde ? "biometrie_yaounde" : "visa_classique",
    title: biometrieYaounde
      ? "Visa classique + biométrie à Yaoundé"
      : "Visa classique",
    message: `Pour ${dest.label} (${labelType(type)}), un visa classique au consulat est requis.`,
    delai,
    biometrieYaounde,
    hasEVisa: false,
    recommendation:
      "Démarrez votre demande pour recevoir un bilan de faisabilité écrit et la liste exacte des pièces.",
  };
}

function labelType(t: TypeVisa): string {
  switch (t) {
    case "tourisme": return "tourisme";
    case "etudes": return "études";
    case "travail": return "travail";
    case "business": return "business";
    case "famille": return "famille";
    case "transit": return "transit";
    default: return "autre motif";
  }
}
