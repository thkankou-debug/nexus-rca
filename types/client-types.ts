// ============================================================================
// Types et constantes partages entre server et client components.
// Ce fichier ne doit PAS contenir de "use client" et ne doit pas importer
// de composants React. Il est consommable depuis n'importe ou.
// ============================================================================

export type ClientType = "particulier" | "entreprise" | "institution";

export interface Client {
  id: string;
  reference: string | null;
  type: ClientType;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  numero_identification: string | null;
  email: string | null;
  telephone: string | null;
  telephone_2: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  profile_id: string | null;
  notes: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  particulier: "Particulier",
  entreprise: "Entreprise",
  institution: "Institution",
};
