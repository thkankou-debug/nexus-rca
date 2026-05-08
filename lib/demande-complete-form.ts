// ============================================================================
// LIB — Formulaire dossier complet (refonte v4 selon BRIEF_FORMULAIRE_DEMANDE.md)
// Types, listes énumérées, valeurs par défaut, helpers de validation maison.
// ============================================================================

// ─── Listes énumérées (UI) ──────────────────────────────────────────────────

export const SEXES = ["Masculin", "Féminin", "Autre"] as const;
export type Sexe = (typeof SEXES)[number];

export const SITUATIONS_MATRIMONIALES = [
  "Célibataire",
  "Marié(e)",
  "Divorcé(e)",
  "Veuf(ve)",
] as const;
export type SituationMatrimoniale = (typeof SITUATIONS_MATRIMONIALES)[number];

export const NIVEAUX_ETUDES = [
  "Aucun",
  "Primaire",
  "Secondaire",
  "Bac",
  "Bac+2",
  "Bac+3",
  "Bac+5",
  "Doctorat",
] as const;
export type NiveauEtudes = (typeof NIVEAUX_ETUDES)[number];

// ─── Services proposés (selon brief — 7 services structurés) ────────────────

export const SERVICES_COMPLETS = [
  "Visa & e-Visa",
  "Études à l'étranger",
  "Billet d'avion & Hôtels",
  "Incubateur & Financement",
  "Recouvrement de documents",
  "Transferts d'argent",
  "Autre service administratif",
] as const;
export type ServiceComplet = (typeof SERVICES_COMPLETS)[number];

// ─── Catégories par service (dynamique) ─────────────────────────────────────

export const CATEGORIES_PAR_SERVICE: Record<ServiceComplet, string[]> = {
  "Visa & e-Visa": [
    "Visa tourisme",
    "Visa étudiant",
    "Visa affaires",
    "Visa travail",
    "Visa famille",
    "Visa médical",
    "e-Visa",
    "Renouvellement",
    "Autre",
  ],
  "Études à l'étranger": [
    "Admission Licence",
    "Admission Master",
    "Admission Doctorat",
    "Bourse d'études",
    "Préparation TCF / IELTS",
    "Orientation académique",
    "Autre",
  ],
  "Billet d'avion & Hôtels": [
    "Vol simple",
    "Vol aller-retour",
    "Vol multi-destinations",
    "Réservation hôtel",
    "Voyage d'affaires",
    "Voyage en groupe",
    "Autre",
  ],
  "Incubateur & Financement": [
    "Incubateur de projet",
    "Recherche de financement",
    "Mise en relation investisseurs",
    "Accompagnement business",
    "Partenariat",
    "Autre",
  ],
  "Recouvrement de documents": [
    "Acte de naissance",
    "Acte de mariage",
    "Diplôme",
    "Bulletin scolaire",
    "Casier judiciaire",
    "Légalisation",
    "Apostille",
    "Autre",
  ],
  "Transferts d'argent": [
    "Transfert national",
    "Transfert international entrant",
    "Transfert international sortant",
    "Change de devises",
    "Mobile Money",
    "Autre",
  ],
  "Autre service administratif": [
    "Traduction certifiée",
    "Rédaction CV / lettre",
    "Demande administrative",
    "Conseil",
    "Autre",
  ],
};

// ─── Catégories de documents (8 selon brief) ────────────────────────────────

export const DOCUMENT_CATEGORIES = [
  { value: "piece_identite", label: "Pièce d'identité" },
  { value: "passeport", label: "Passeport" },
  { value: "diplomes", label: "Diplômes" },
  { value: "documents_financiers", label: "Documents financiers" },
  { value: "documents_administratifs", label: "Documents administratifs" },
  { value: "lettre_invitation", label: "Lettre d'invitation" },
  { value: "photos_identite", label: "Photos d'identité" },
  { value: "documents_complementaires", label: "Documents complémentaires" },
] as const;
export type DocumentCategorie = (typeof DOCUMENT_CATEGORIES)[number]["value"];

// ─── Mode d'identification (étape 00) ───────────────────────────────────────

export type IdentificationMode = "" | "deja_client" | "nouveau";

// ─── Détails dynamiques section 03 ──────────────────────────────────────────

export type DetailsVisa = {
  type_passeport?: "Ordinaire" | "Diplomatique" | "Service" | "";
  numero_passeport?: string;
  expiration_passeport?: string;
  pays_visites?: string;
  refus_visa_anterieur?: "oui" | "non" | "";
  pays_refus?: string;
  date_refus?: string;
  invitant?: "oui" | "non" | "";
  nom_invitant?: string;
  motif_voyage?: "Tourisme" | "Affaires" | "Études" | "Médical" | "Famille" | "Autre" | "";
  duree_sejour_jours?: string;
};

export type DetailsEtudes = {
  dernier_diplome?: string;
  domaine_etudes?: string;
  niveau_recherche?: "Licence" | "Master" | "Doctorat" | "Formation pro" | "";
  etablissement_cible?: string;
  admission_obtenue?: "oui" | "non" | "";
  passeport_disponible?: "oui" | "non" | "";
  niveau_linguistique?: string;
  besoin_bourse?: "oui" | "non" | "";
};

export type DetailsBusiness = {
  nom_projet?: string;
  secteur?: string;
  pays_activite?: string;
  stade_projet?: "Idée" | "Prototype" | "Lancé" | "En croissance" | "";
  type_accompagnement?: string;
  societe_enregistree?: "oui" | "non" | "";
};

export type DetailsAdministratif = {
  type_document?: string;
  organisme_concerne?: string;
  document_disponible?: "oui" | "non" | "";
  date_limite?: string;
};

export type DetailsService =
  | DetailsVisa
  | DetailsEtudes
  | DetailsBusiness
  | DetailsAdministratif
  | Record<string, unknown>;

// ─── Forme principale du formulaire ─────────────────────────────────────────

export type DemandeCompletePayload = {
  // Étape 00
  identification_mode: IdentificationMode;

  // Section 01 — Identification
  nom_complet: string;
  sexe: Sexe | "";
  date_naissance: string;
  nationalite: string;
  pays: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  // Mots de passe — uniquement pour mode "nouveau" (saisis par le client)
  password: string;
  password_confirm: string;
  situation_matrimoniale: SituationMatrimoniale | "";
  profession: string;
  employeur: string;
  niveau_etudes: NiveauEtudes | "";

  // Section 02 — Type de demande
  service: ServiceComplet | "";
  categorie_demande: string;
  pays_concerne: string;
  type_procedure: string;
  date_souhaitee: string;
  dossier_existant: boolean;
  numero_dossier_existant: string;

  // Section 03 — Informations spécifiques (dynamique)
  details_service: DetailsService;

  // Section 05 — Informations complémentaires
  informations_complementaires: string;

  // Section 06 — Validation
  consentement_examen: boolean;
  consentement_documents: boolean;
  consentement_recontact: boolean;
};

export const DEFAULT_FORM_VALUES_COMPLETE: DemandeCompletePayload = {
  identification_mode: "",
  nom_complet: "",
  sexe: "",
  date_naissance: "",
  nationalite: "",
  pays: "République Centrafricaine",
  ville: "",
  adresse: "",
  telephone: "",
  email: "",
  password: "",
  password_confirm: "",
  situation_matrimoniale: "",
  profession: "",
  employeur: "",
  niveau_etudes: "",
  service: "",
  categorie_demande: "",
  pays_concerne: "",
  type_procedure: "",
  date_souhaitee: "",
  dossier_existant: false,
  numero_dossier_existant: "",
  details_service: {},
  informations_complementaires: "",
  consentement_examen: false,
  consentement_documents: false,
  consentement_recontact: false,
};

// ─── Validation par section (validation maison, pas de Zod) ─────────────────

export type ValidationErrors = Record<string, string | undefined>;

export function validateSection(
  section: number,
  form: DemandeCompletePayload
): ValidationErrors {
  const e: ValidationErrors = {};

  if (section === 0) {
    if (!form.identification_mode)
      e.identification_mode = "Veuillez choisir une option";
  }

  if (section === 1) {
    if (!form.nom_complet.trim()) e.nom_complet = "Nom complet requis";
    if (!form.sexe) e.sexe = "Sexe requis";
    if (!form.date_naissance) e.date_naissance = "Date de naissance requise";
    if (!form.nationalite.trim()) e.nationalite = "Nationalité requise";
    if (!form.pays.trim()) e.pays = "Pays de résidence requis";
    if (!form.ville.trim()) e.ville = "Ville requise";
    if (!form.adresse.trim()) e.adresse = "Adresse requise";
    if (!form.telephone.trim()) e.telephone = "Téléphone requis";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email invalide";
    // Mots de passe — uniquement requis pour mode "nouveau"
    if (form.identification_mode === "nouveau") {
      if (!form.password) e.password = "Mot de passe requis";
      else if (form.password.length < 8)
        e.password = "Le mot de passe doit faire au moins 8 caractères";
      if (!form.password_confirm)
        e.password_confirm = "Veuillez confirmer le mot de passe";
      else if (form.password !== form.password_confirm)
        e.password_confirm = "Les mots de passe ne correspondent pas";
    }
    if (!form.situation_matrimoniale)
      e.situation_matrimoniale = "Situation matrimoniale requise";
    if (!form.profession.trim()) e.profession = "Profession requise";
    if (!form.niveau_etudes) e.niveau_etudes = "Niveau d'études requis";
  }

  if (section === 2) {
    if (!form.service) e.service = "Service requis";
    if (!form.categorie_demande)
      e.categorie_demande = "Catégorie requise";
    if (!form.pays_concerne.trim())
      e.pays_concerne = "Pays concerné requis";
    if (!form.type_procedure.trim())
      e.type_procedure = "Type de procédure requis";
    if (!form.date_souhaitee) e.date_souhaitee = "Date prévue requise";
    if (form.dossier_existant && !form.numero_dossier_existant.trim())
      e.numero_dossier_existant = "Numéro de dossier requis";
  }

  // Section 3, 4, 5 : tous champs optionnels
  // Section 6 : consentements validés à la soumission finale

  return e;
}

export function validateFinal(form: DemandeCompletePayload): ValidationErrors {
  const e: ValidationErrors = {};
  Object.assign(e, validateSection(0, form));
  Object.assign(e, validateSection(1, form));
  Object.assign(e, validateSection(2, form));
  if (!form.consentement_examen)
    e.consentement_examen = "Vous devez certifier l'exactitude des informations";
  if (!form.consentement_documents)
    e.consentement_documents =
      "Vous devez autoriser Nexus RCA à traiter votre dossier";
  if (!form.consentement_recontact)
    e.consentement_recontact =
      "Vous devez accepter d'être contacté par Nexus RCA";
  return e;
}

// ─── Force du mot de passe ──────────────────────────────────────────────────

export type PasswordStrength = "vide" | "faible" | "moyen" | "fort";

export function getPasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) return "vide";
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (score <= 2) return "faible";
  if (score <= 3) return "moyen";
  return "fort";
}
