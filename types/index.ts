export type UserRole = "super_admin" | "admin" | "agent" | "client";

export type DemandeStatus =
  | "nouveau"
  | "en_cours"
  | "en_attente"
  | "incomplet"
  | "en_traitement"
  | "complete"
  | "annule";

export type UrgenceLevel = "faible" | "normale" | "elevee" | "critique";

export type ServiceType =
  | "visa"
  | "billet"
  | "hotel"
  | "tcf"
  | "etudes"
  | "financement"
  | "partenariat"
  | "administratif"
  | "change_transfert"
  | "assistance"
  | "autre";

export interface Profile {
  id: string;
  email: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  pays: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Détails dynamiques par type de service (JSONB côté Supabase) ----

export interface DetailsVisa {
  type_visa?: string;
  date_voyage?: string;
  passeport_disponible?: boolean;
  documents_disponibles?: string[];
}

export interface DetailsBilletHotel {
  ville_depart?: string;
  destination?: string;
  date_depart?: string;
  date_retour?: string;
  voyageurs?: number;
  classe?: string;
}

export interface DetailsEtudes {
  niveau?: string;
  domaine?: string;
  annee_cible?: string;
  etablissement_vise?: string;
}

export interface DetailsBusiness {
  nom_projet?: string;
  secteur?: string;
  stade?: string;
  montant_recherche?: string;
  objectif?: string;
}

export interface DetailsAdministratif {
  type_document?: string;
  besoin?: string;
  delai?: string;
}

export type DetailsService =
  | DetailsVisa
  | DetailsBilletHotel
  | DetailsEtudes
  | DetailsBusiness
  | DetailsAdministratif
  | Record<string, unknown>;

export interface Demande {
  id: string;
  client_id: string | null;
  agent_id: string | null;
  nom_complet: string;
  email: string;
  telephone: string;
  pays: string;
  ville: string | null;
  langue_preferee: string | null;
  service: string;
  objet: string | null;
  description: string;
  urgence: UrgenceLevel;
  statut: DemandeStatus;
  date_souhaitee: string | null;
  pays_concerne: string | null;
  destination: string | null;
  budget_estimatif: string | null;
  traitement_prioritaire: boolean;
  source: string;
  details_service: DetailsService;
  consentement_examen: boolean;
  consentement_documents: boolean;
  consentement_recontact: boolean;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandeAvecDocuments extends Demande {
  nombre_documents: number;
}

export interface DemandeDocument {
  id: string;
  demande_id: string;
  uploaded_by: string | null;
  storage_path: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  created_at: string;
}

export interface RendezVous {
  id: string;
  client_id: string;
  demande_id: string | null;
  date_rdv: string;
  duree_minutes: number;
  sujet: string;
  statut: string;
  notes: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  traite: boolean;
  created_at: string;
}

// ---- Module RH / Paie (migration 022) -----------------------------------

export type EmployeeStatut = "actif" | "inactif" | "suspendu" | "parti";
export type EmployeeFrequencePaie = "mensuel" | "bi-mensuel" | "hebdomadaire";
export type EmployeeTypeContrat = "CDI" | "CDD" | "Stage" | "Freelance" | string;

export interface Employee {
  id: string;
  profile_id: string | null;

  nom_complet: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  date_naissance: string | null;
  numero_cni: string | null;

  poste: string;
  departement: string;
  date_embauche: string;
  type_contrat: EmployeeTypeContrat | null;
  statut: EmployeeStatut;

  salaire_base: number;
  frequence_paie: EmployeeFrequencePaie;

  notes_internes: string | null;

  created_at: string;
  updated_at: string;
}

export type PayslipStatut = "brouillon" | "en_attente_validation" | "validee";

export interface PayslipLigne {
  type: "prime" | "indemnite" | "heures_supp" | "avance" | "deduction" | string;
  label: string;
  montant: number;
}

export interface PayslipCotisations {
  cnss?: number;
  irpp?: number;
  its?: number;
  [key: string]: number | undefined;
}

export interface Payslip {
  id: string;
  employee_id: string;
  reference: string;

  periode_debut: string;
  periode_fin: string;
  mois_libelle: string;

  salaire_brut: number;
  salaire_net: number;

  details_lignes: PayslipLigne[];
  cotisations: PayslipCotisations;

  statut: PayslipStatut;
  created_by: string | null;
  submitted_at: string | null;
  validated_by: string | null;
  validated_at: string | null;
  pdf_url: string | null;

  notes_admin: string | null;
  notes_super_admin: string | null;

  created_at: string;
  updated_at: string;
}

export type PayslipHistoryAction =
  | "created"
  | "submitted"
  | "validated"
  | "rejected"
  | "edited";

export interface PayslipValidationHistory {
  id: string;
  payslip_id: string;
  action: PayslipHistoryAction;
  performed_by: string | null;
  note: string | null;
  created_at: string;
}

export type HrDocumentType = "contrat" | "diplome" | "piece_identite" | "autre";

// Sous-catégories par type (Phase B.2)
export const HR_DOCUMENT_SUBCATEGORIES: Record<HrDocumentType, string[]> = {
  contrat: ["CDI", "CDD", "Stage", "Avenant", "Rupture"],
  diplome: ["Bac", "Licence", "Master", "Doctorat", "Certification", "Autre"],
  piece_identite: ["CNI", "Passeport", "Permis", "Visa", "Autre"],
  autre: ["Justificatif domicile", "Attestation", "Lettre", "Autre"],
};

export interface HrDocument {
  id: string;
  employee_id: string;
  type: HrDocumentType;
  subcategory: string | null;
  nom: string;
  description: string | null;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// Phase B.3 — notes historisées (append-only)
export interface EmployeeNote {
  id: string;
  employee_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

// Phase A — Documents entreprise (migration 024)
export type CompanyDocumentType =
  | "reglement_interieur"
  | "charte"
  | "convention_collective"
  | "guide"
  | "proces_verbal"
  | "autre";

export type CompanyDocumentVisibility = "tous" | "staff" | "super_admin";

export const COMPANY_DOCUMENT_TYPE_LABELS: Record<CompanyDocumentType, string> = {
  reglement_interieur: "Règlement intérieur",
  charte: "Charte",
  convention_collective: "Convention collective",
  guide: "Guide",
  proces_verbal: "Procès-verbal",
  autre: "Autre",
};

export interface CompanyDocument {
  id: string;
  type: CompanyDocumentType;
  name: string;
  description: string | null;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  version: string | null;
  visible_to: CompanyDocumentVisibility;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}
