-- ============================================================================
-- NEXUS RCA — Migration 030 : enrichissement formulaire dossier complet
-- À exécuter dans Supabase SQL Editor
-- (déjà appliquée via MCP — fichier conservé pour traçabilité)
-- ============================================================================

-- ─── 1. Colonnes additionnelles sur `demandes` ──────────────────────────────
ALTER TABLE public.demandes
  ADD COLUMN IF NOT EXISTS reference text UNIQUE,
  ADD COLUMN IF NOT EXISTS sexe text,
  ADD COLUMN IF NOT EXISTS date_naissance date,
  ADD COLUMN IF NOT EXISTS nationalite text,
  ADD COLUMN IF NOT EXISTS adresse text,
  ADD COLUMN IF NOT EXISTS situation_matrimoniale text,
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS employeur text,
  ADD COLUMN IF NOT EXISTS niveau_etudes text,
  ADD COLUMN IF NOT EXISTS categorie_demande text,
  ADD COLUMN IF NOT EXISTS type_procedure text,
  ADD COLUMN IF NOT EXISTS dossier_existant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS numero_dossier_existant text,
  ADD COLUMN IF NOT EXISTS informations_complementaires text;

-- ─── 2. Catégorie sur `demande_documents` ───────────────────────────────────
ALTER TABLE public.demande_documents
  ADD COLUMN IF NOT EXISTS categorie text;

CREATE INDEX IF NOT EXISTS idx_demande_documents_categorie
  ON public.demande_documents(demande_id, categorie);

-- ─── 3. Fonction de génération référence : DEM-YYYY-NNNNNN ──────────────────
CREATE OR REPLACE FUNCTION public.gen_demande_ref()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year integer;
  next_seq integer;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::integer;
  SELECT COALESCE(
    MAX(SUBSTRING(reference FROM '([0-9]+)$')::integer),
    0
  ) + 1
    INTO next_seq
    FROM public.demandes
    WHERE reference LIKE 'DEM-' || current_year || '-%';
  RETURN 'DEM-' || current_year || '-' || LPAD(next_seq::text, 6, '0');
END;
$$;

-- ─── 4. Trigger auto-génération référence ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_demande_ref()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := public.gen_demande_ref();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_demande_ref ON public.demandes;
CREATE TRIGGER trg_demande_ref
  BEFORE INSERT ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_demande_ref();

-- ─── 5. Backfill — référence pour les demandes existantes ───────────────────
UPDATE public.demandes
SET reference = public.gen_demande_ref()
WHERE reference IS NULL;

-- ─── 6. Permissions ──────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.gen_demande_ref() TO service_role;
GRANT EXECUTE ON FUNCTION public.gen_demande_ref() TO authenticated;
