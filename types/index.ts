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
