-- ============================================================================
-- 044 — P3 : services, documents_requis, dossier_etapes, dossier_partages,
-- taches, affectations_hist
--
-- Schema fondation uniquement (P3) — aucune UI consommatrice avant A5/A7.
-- RLS activee dans cette meme migration, deny-all par defaut la ou la
-- policy definitive n'est pas encore ecrite. Colonnes en anglais
-- (status/created_at) sur les nouvelles tables, noms de table en francais
-- (vocabulaire du depot, pas de renommage de ce qui existe).
-- ============================================================================

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nom text NOT NULL,
  categorie text NOT NULL,
  description text,
  tarif_type text NOT NULL DEFAULT 'sur_devis' CHECK (tarif_type IN ('fixe', 'sur_devis')),
  tarif_montant numeric,
  devise text NOT NULL DEFAULT 'XAF',
  delai_indicatif text,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  ordre_affichage int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active services" ON public.services
  FOR SELECT USING (status = 'actif');
CREATE POLICY "Staff can manage services" ON public.services
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.documents_requis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text,
  obligatoire boolean NOT NULL DEFAULT true,
  ordre_affichage int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents_requis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read documents_requis" ON public.documents_requis
  FOR SELECT USING (true);
CREATE POLICY "Staff can manage documents_requis" ON public.documents_requis
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

-- Etapes generiques par service — alimentera le stepper de la fiche dossier
-- (A5) et la machine a etats (voir la migration d'extension de
-- demande_status, tenue a part car elle touche des donnees reelles).
CREATE TABLE public.dossier_etapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  ordre int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, code)
);
ALTER TABLE public.dossier_etapes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage dossier_etapes" ON public.dossier_etapes
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

-- Partage d'un dossier avec un partenaire externe — portee "partages" de
-- dossier.read.partage (voir P2, role_permissions).
CREATE TABLE public.dossier_partages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  partenaire_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (demande_id, partenaire_id)
);
ALTER TABLE public.dossier_partages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partenaire can read own shares" ON public.dossier_partages
  FOR SELECT USING (partenaire_id = (select auth.uid()));
CREATE POLICY "Staff can manage dossier_partages" ON public.dossier_partages
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.taches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  demande_id uuid REFERENCES public.demandes(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire', 'en_cours', 'terminee', 'annulee')),
  priority text NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.taches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assigned staff can read own taches" ON public.taches
  FOR SELECT USING (assigned_to = (select auth.uid()));
CREATE POLICY "Assigned staff can update own taches" ON public.taches
  FOR UPDATE USING (assigned_to = (select auth.uid()));
CREATE POLICY "Staff can manage taches" ON public.taches
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.affectations_hist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  previous_agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  new_agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affectations_hist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage affectations_hist" ON public.affectations_hist
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));
