// P1c point 2 : types générés depuis le schéma réel via generate_typescript_types
// (connecteur Supabase) — jamais à la main, pour ne pas dériver à la prochaine
// migration. Les tables ci-dessous n'avaient encore aucun type dans ce fichier.
import type { Database } from "./database";
import type { DossierStatus } from "@/lib/dossier-transitions";

export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentLink = Database["public"]["Tables"]["payment_links"]["Row"];
export type PaymentEvent = Database["public"]["Tables"]["payment_events"]["Row"];
export type StripeWebhookLog = Database["public"]["Tables"]["stripe_webhook_log"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Transfert = Database["public"]["Tables"]["transferts"]["Row"];
export type QuickSale = Database["public"]["Tables"]["quick_sales"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentRequest = Database["public"]["Tables"]["appointment_requests"]["Row"];
export type ContactDemande = Database["public"]["Tables"]["contact_demandes"]["Row"];
export type VisaExpressRequest = Database["public"]["Tables"]["visa_express_requests"]["Row"];
export type InsuranceQuote = Database["public"]["Tables"]["insurance_quotes"]["Row"];

export type UserRole =
  | "super_admin"
  | "admin"
  | "dg"
  | "daf"
  | "chef_service"
  | "agent"
  | "comptable"
  | "moderateur"
  | "partenaire"
  | "client";

// Valeurs 2026-04 (018-032), conservees telles quelles — aucun dossier reel
// ne les porte plus depuis la reassignation 049b, mais l'enum Postgres ne
// retire jamais une valeur (regle P3, additif pur).
export type LegacyDemandeStatus =
  | "nouveau"
  | "en_cours"
  | "en_attente"
  | "incomplet"
  | "en_traitement"
  | "complete"
  | "annule";

// Machine a etats P3 (migration 049a/049b) — voir lib/dossier-transitions.ts
// pour le graphe de transitions valide.
export type DemandeStatus = LegacyDemandeStatus | DossierStatus;

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
  // Colonnes DB existantes (migration ≤ 029)
  actif: boolean;
  poste: string | null;
  notes_internes: string | null;
  // Colonne ajoutée par migration 032
  specialites: string[] | null;
  // Colonnes ajoutées par migration 047 (P3)
  service_id: string | null;
  availability_status: "disponible" | "occupe" | "absent";
}

export type CategorieDossierSlug =
  | "visa"
  | "etudes_bourses"
  | "billets_hotels"
  | "assurances"
  | "financement_incubateur"
  | "digitalisation"
  | "recouvrement"
  | "transferts"
  | "autres";

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
  // Colonnes ajoutées par migrations 030-032
  reference: string | null;
  sexe: string | null;
  date_naissance: string | null;
  nationalite: string | null;
  adresse: string | null;
  situation_matrimoniale: string | null;
  profession: string | null;
  employeur: string | null;
  niveau_etudes: string | null;
  categorie_demande: string | null;
  type_procedure: string | null;
  dossier_existant: boolean | null;
  numero_dossier_existant: string | null;
  informations_complementaires: string | null;
  current_step: number | null;
  current_step_label: string | null;
  categorie_dossier: CategorieDossierSlug | null;
  // Absente de cette interface alors que la colonne existe en DB depuis
  // longtemps (bug déjà signalé dans CLAUDE.md, aussi corrigé indépendamment
  // par P1c) — corrigée ici à l'occasion de l'audit C0 qui a établi qu'elle
  // n'est peuplée sur aucun des 16 dossiers réels (voir docs/AUDIT_CRM.md §3).
  client_record_id: string | null;
  // Colonnes ajoutées par migration 047 (P3)
  deadline: string | null;
  service_id: string | null;
  amount_estimated: number | null;
  archived_at: string | null;
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

// P1c point 2 : dérivé du type généré plutôt que maintenu à la main — l'ancienne
// version (8 champs) datait d'avant l'ajout de reference/status/ip/user_agent/
// source/processed_at/processed_by/notes_internes/updated_at et n'était
// importée nulle part (le vrai consommateur, ContactsManager.tsx, définit son
// propre type local `ContactRow`).
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

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

// Phase B — Conges & absences (migration 025)
export interface LeaveType {
  id: string;
  code: string;
  label: string;
  max_days_year: number;
  color_hex: string;
  paid: boolean;
  requires_doc: boolean;
  active: boolean;
  created_at: string;
}

export type LeaveRequestStatut = "en_attente" | "valide" | "refuse" | "annule";

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  half_day_start: boolean;
  half_day_end: boolean;
  reason: string | null;
  doc_url: string | null;
  statut: LeaveRequestStatut;
  requested_by: string | null;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  leave_type_id: string;
  acquired_days: number;
  used_days: number;
  created_at: string;
  updated_at: string;
}

export interface HolidayCar {
  id: string;
  year: number;
  date: string;
  label: string;
  fixed: boolean;
  created_at: string;
}

// Phase C — Onboarding (migration 026)
export type OnboardingTaskCategory =
  | "contrat"
  | "equipement"
  | "formation"
  | "admin"
  | "rh"
  | "integration"
  | "autre";

export const ONBOARDING_CATEGORY_LABELS: Record<OnboardingTaskCategory, string> = {
  contrat: "Contrat",
  equipement: "Équipement",
  formation: "Formation",
  admin: "Administratif",
  rh: "RH",
  integration: "Intégration",
  autre: "Autre",
};

export interface OnboardingTaskTemplate {
  order: number;
  label: string;
  category: OnboardingTaskCategory;
  days_offset: number;
  mandatory: boolean;
  description?: string;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string | null;
  type_contrat: string | null;
  default_tasks: OnboardingTaskTemplate[];
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeOnboarding {
  id: string;
  employee_id: string;
  template_id: string | null;
  started_at: string;
  completed_at: string | null;
  completion_pct: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingTask {
  id: string;
  employee_onboarding_id: string;
  task_order: number;
  label: string;
  category: OnboardingTaskCategory;
  description: string | null;
  due_date: string | null;
  mandatory: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Phase D — Évaluations performance (migration 027)
export type ReviewPeriodStatut = "planifie" | "en_cours" | "termine" | "archive";
export type PerformanceReviewStatut =
  | "programme"
  | "auto_eval"
  | "manager_review"
  | "meeting"
  | "signe"
  | "annule";

export interface ReviewPeriod {
  id: string;
  year: number;
  label: string;
  description: string | null;
  start_date: string;
  end_date: string;
  statut: ReviewPeriodStatut;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SelfAssessment {
  realizations?: string;
  challenges?: string;
  skills_developed?: string;
  self_rating?: number; // 1-5
  objectives_review?: Array<{
    objective: string;
    achievement: number; // 0-100
    comment?: string;
  }>;
}

export interface ManagerAssessment {
  strengths?: string;
  areas_to_improve?: string;
  overall_rating?: number; // 1-5
  salary_recommendation?: string;
  comments?: string;
}

export interface ReviewObjective {
  objective: string;
  target?: string;
  deadline?: string;
  weight?: number; // %
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  period_id: string;
  manager_id: string | null;
  statut: PerformanceReviewStatut;
  self_assessment: SelfAssessment;
  self_assessment_submitted_at: string | null;
  manager_assessment: ManagerAssessment;
  manager_assessment_submitted_at: string | null;
  objectives: ReviewObjective[];
  formation_plan: string | null;
  meeting_date: string | null;
  meeting_notes: string | null;
  signed_employee_at: string | null;
  signed_manager_at: string | null;
  notes_finales: string | null;
  created_at: string;
  updated_at: string;
}

// Phase E — Settings RH (migration 028)

// ─── P3 — Extension du schéma métier (migrations 044-048) ──────────────────
// Dérivés du type Database généré (jamais retapés à la main — voir CLAUDE.md,
// bug déjà résolu "Property 'poste' does not exist").
export type ServiceCatalogue = Database["public"]["Tables"]["services"]["Row"];
export type DocumentRequis = Database["public"]["Tables"]["documents_requis"]["Row"];
export type DossierEtape = Database["public"]["Tables"]["dossier_etapes"]["Row"];
export type DossierPartage = Database["public"]["Tables"]["dossier_partages"]["Row"];
export type Tache = Database["public"]["Tables"]["taches"]["Row"];
export type AffectationHist = Database["public"]["Tables"]["affectations_hist"]["Row"];
export type Devis = Database["public"]["Tables"]["devis"]["Row"];
export type DevisLigne = Database["public"]["Tables"]["devis_lignes"]["Row"];
export type Facture = Database["public"]["Tables"]["factures"]["Row"];
export type FactureLigne = Database["public"]["Tables"]["facture_lignes"]["Row"];
export type Echeancier = Database["public"]["Tables"]["echeanciers"]["Row"];
export type CategorieCompta = Database["public"]["Tables"]["categories_compta"]["Row"];
export type CaisseSession = Database["public"]["Tables"]["caisse_sessions"]["Row"];
export type Commission = Database["public"]["Tables"]["commissions"]["Row"];
export type ContenuSite = Database["public"]["Tables"]["contenus_site"]["Row"];
export type Faq = Database["public"]["Tables"]["faq"]["Row"];
export type Partenaire = Database["public"]["Tables"]["partenaires"]["Row"];
export type Temoignage = Database["public"]["Tables"]["temoignages"]["Row"];
export type PaysDestination = Database["public"]["Tables"]["pays_destinations"]["Row"];
export type Bureau = Database["public"]["Tables"]["bureaux"]["Row"];
export type NotificationPrefs = Database["public"]["Tables"]["notification_prefs"]["Row"];
export type AgencySettings = Database["public"]["Tables"]["agency_settings"]["Row"];
export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"];
export type RhSettingCategory =
  | "general"
  | "cotisations"
  | "paie"
  | "conges"
  | "contrat"
  | "notifications";

export const RH_SETTING_CATEGORY_LABELS: Record<RhSettingCategory, string> = {
  general: "Général",
  cotisations: "Cotisations",
  paie: "Paie",
  conges: "Congés",
  contrat: "Contrat",
  notifications: "Notifications",
};

export interface RhSetting {
  id: string;
  key: string;
  label: string;
  category: RhSettingCategory;
  value_text: string | null;
  value_number: number | null;
  value_json: unknown;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
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
