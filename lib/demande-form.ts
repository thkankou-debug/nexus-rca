import type { ServiceType } from "@/types";

// ============================================================================
// TYPES DE SERVICE (pour le formulaire complet)
// ============================================================================
export interface ServiceTypeConfig {
  value: ServiceType;
  label: string;
  description: string;
  icon: string; // nom emoji/simple pour affichage
  hasDynamicFields: boolean;
}

export const SERVICE_TYPES: ServiceTypeConfig[] = [
  {
    value: "visa",
    label: "Visa / e-Visa",
    description: "Tourisme, études, affaires, travail",
    icon: "🛂",
    hasDynamicFields: true,
  },
  {
    value: "billet",
    label: "Billet d'avion",
    description: "Réservation de vols nationaux et internationaux",
    icon: "✈️",
    hasDynamicFields: true,
  },
  {
    value: "hotel",
    label: "Hôtel",
    description: "Réservation d'hébergement",
    icon: "🏨",
    hasDynamicFields: true,
  },
  {
    value: "tcf",
    label: "TCF Canada",
    description: "Préparation au test de français",
    icon: "📝",
    hasDynamicFields: true,
  },
  {
    value: "etudes",
    label: "Études / Bourses",
    description: "Admission universitaire et bourses d'études",
    icon: "🎓",
    hasDynamicFields: true,
  },
  {
    value: "financement",
    label: "Financement business",
    description: "Recherche de financement de projet",
    icon: "💼",
    hasDynamicFields: true,
  },
  {
    value: "partenariat",
    label: "Partenariat",
    description: "Mise en relation d'affaires",
    icon: "🤝",
    hasDynamicFields: true,
  },
  {
    value: "administratif",
    label: "Service administratif",
    description: "CV, traduction, formulaires, documents",
    icon: "📋",
    hasDynamicFields: true,
  },
  {
    value: "change_transfert",
    label: "Change / Transfert d'argent",
    description: "Western Union, MoneyGram, change devises",
    icon: "💱",
    hasDynamicFields: false,
  },
  {
    value: "assistance",
    label: "Assistance générale",
    description: "Conseil, orientation, accompagnement",
    icon: "💬",
    hasDynamicFields: false,
  },
  {
    value: "autre",
    label: "Autre",
    description: "Demande hors catégorie",
    icon: "✨",
    hasDynamicFields: false,
  },
];

export function getServiceTypeConfig(
  value: ServiceType | string
): ServiceTypeConfig | undefined {
  return SERVICE_TYPES.find((s) => s.value === value);
}

// Mapping depuis les slugs de services publics (lib/services.ts) vers ServiceType
export const SERVICE_SLUG_TO_TYPE: Record<string, ServiceType> = {
  visa: "visa",
  tcf: "tcf",
  bourses: "etudes",
  financement: "financement",
  administratif: "administratif",
  billets: "billet",
  change: "change_transfert",
  transfert: "change_transfert",
  "nexus-ia": "assistance",
};

// ============================================================================
// UPLOAD DE FICHIERS : contraintes
// ============================================================================
export const FILE_MAX_SIZE_MB = 10;
export const FILE_MAX_SIZE_BYTES = FILE_MAX_SIZE_MB * 1024 * 1024;
export const FILES_MAX_COUNT = 8;

export const FILE_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const FILE_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > FILE_MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Fichier trop volumineux (max ${FILE_MAX_SIZE_MB} Mo)`,
    };
  }
  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (!ext || !FILE_ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Format non supporté. Autorisés : PDF, JPG, PNG, DOC, DOCX`,
    };
  }
  return { valid: true };
}

// ============================================================================
// VALIDATION DES CHAMPS
// ============================================================================
export interface DemandeCompleteForm {
  // Infos perso
  nom_complet: string;
  email: string;
  telephone: string;
  pays: string;
  ville: string;
  langue_preferee: string;

  // Service
  service_type: ServiceType | "";

  // Détails principaux
  objet: string;
  description: string;
  urgence: "faible" | "normale" | "elevee" | "critique";
  date_souhaitee: string;
  pays_concerne: string;
  destination: string;
  budget_estimatif: string;

  // Détails dynamiques (selon service_type)
  details: Record<string, unknown>;

  // Consentement
  consentement_examen: boolean;
  consentement_documents: boolean;
  consentement_recontact: boolean;

  // Prioritaire
  traitement_prioritaire: boolean;
}

export const DEFAULT_FORM_VALUES: DemandeCompleteForm = {
  nom_complet: "",
  email: "",
  telephone: "",
  pays: "Centrafrique",
  ville: "",
  langue_preferee: "Français",
  service_type: "",
  objet: "",
  description: "",
  urgence: "normale",
  date_souhaitee: "",
  pays_concerne: "",
  destination: "",
  budget_estimatif: "",
  details: {},
  consentement_examen: false,
  consentement_documents: false,
  consentement_recontact: true,
  traitement_prioritaire: false,
};

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validateDemandeForm(
  form: DemandeCompleteForm
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Infos personnelles obligatoires
  if (!form.nom_complet.trim()) errors.nom_complet = "Nom complet requis";
  if (!form.email.trim()) errors.email = "Email requis";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Email invalide";
  if (!form.telephone.trim()) errors.telephone = "Téléphone requis";
  if (!form.pays.trim()) errors.pays = "Pays requis";
  if (!form.ville.trim()) errors.ville = "Ville requise";

  // Service
  if (!form.service_type) errors.service_type = "Veuillez choisir un service";

  // Description
  if (!form.objet.trim()) errors.objet = "Objet requis";
  else if (form.objet.length < 5)
    errors.objet = "Objet trop court (min. 5 caractères)";
  if (!form.description.trim()) errors.description = "Description requise";
  else if (form.description.length < 20)
    errors.description = "Description trop courte (min. 20 caractères)";

  // Consentements obligatoires
  if (!form.consentement_examen)
    errors.consentement_examen =
      "Vous devez accepter que Nexus examine votre demande";
  if (!form.consentement_documents)
    errors.consentement_documents =
      "Vous devez autoriser le traitement des documents";

  return errors;
}
