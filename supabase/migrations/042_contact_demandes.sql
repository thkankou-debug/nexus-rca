-- NE JAMAIS REJOUER SUR UNE BASE EXISTANTE.
-- Recupere le 08/09/2026 depuis supabase_migrations.schema_migrations
-- (version 20260511220546) : applique en base le 11/05/2026, jamais
-- committe en fichier .sql jusqu'ici. Texte exact tire de statements en
-- base (pas une reconstruction par introspection comme
-- 000_schema_baseline.sql), fourni ici pour tracabilite historique
-- uniquement.

CREATE TABLE IF NOT EXISTS public.contact_demandes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL CHECK (type IN ('entreprise', 'partenariat', 'autre')),
  nom_complet   text NOT NULL,
  email         text NOT NULL,
  telephone     text,
  organisation  text,
  message       text NOT NULL,
  statut        text NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'traite', 'archive')),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  traite_par    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  traite_at     timestamptz,
  notes_admin   text,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_demandes_statut    ON public.contact_demandes(statut);
CREATE INDEX IF NOT EXISTS idx_contact_demandes_type      ON public.contact_demandes(type);
CREATE INDEX IF NOT EXISTS idx_contact_demandes_created   ON public.contact_demandes(created_at DESC);

ALTER TABLE public.contact_demandes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_demandes_insert_public" ON public.contact_demandes;
CREATE POLICY "contact_demandes_insert_public"
  ON public.contact_demandes
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "contact_demandes_select_admin" ON public.contact_demandes;
CREATE POLICY "contact_demandes_select_admin"
  ON public.contact_demandes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "contact_demandes_update_admin" ON public.contact_demandes;
CREATE POLICY "contact_demandes_update_admin"
  ON public.contact_demandes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin', 'super_admin')
    )
  );

COMMENT ON TABLE public.contact_demandes IS 'Demandes de contact pro (Entreprise/Partenariat) depuis /contact-pro';
