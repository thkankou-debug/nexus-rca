-- ============================================================================
-- 101 — Accueil & caisse V4 (GO PRODUCTION)
-- Enrichissement opératoire : devis pour la réception, quartier client,
-- rattachement facture←devis sans double paiement, prestations guichet
-- manquantes (tarifs NON inventés : sur_devis).
-- Additif pur. Aucune table existante détruite. POS / 80 mm inchangés.
-- ============================================================================

-- 1. Quartier sur la fiche client (adresse déjà existante).
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS quartier text;

-- 2. Une facture d'accueil peut référencer le devis accepté dont elle copie
--    les lignes. UNIQUE partiel : un devis ne produit qu'une facture.
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS devis_id uuid REFERENCES public.devis(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_devis_unique
  ON public.invoices (devis_id)
  WHERE devis_id IS NOT NULL;

-- Figé après émission : devis_id entre dans le contenu historique.
CREATE OR REPLACE FUNCTION public.invoices_freeze_emitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.emitted_at IS NOT NULL THEN
      RAISE EXCEPTION 'FACTURE_EMISE: une facture émise ne se supprime pas — utilisez un avoir';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.emitted_at IS NOT NULL THEN
    IF NEW.reference IS DISTINCT FROM OLD.reference
      OR NEW.type IS DISTINCT FROM OLD.type
      OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
      OR NEW.motif IS DISTINCT FROM OLD.motif
      OR NEW.client_record_id IS DISTINCT FROM OLD.client_record_id
      OR NEW.client_nom IS DISTINCT FROM OLD.client_nom
      OR NEW.client_coordonnees IS DISTINCT FROM OLD.client_coordonnees
      OR NEW.demande_id IS DISTINCT FROM OLD.demande_id
      OR NEW.ticket_key IS DISTINCT FROM OLD.ticket_key
      OR NEW.devis_id IS DISTINCT FROM OLD.devis_id
      OR NEW.lignes IS DISTINCT FROM OLD.lignes
      OR NEW.total IS DISTINCT FROM OLD.total
      OR NEW.echeance IS DISTINCT FROM OLD.echeance
      OR NEW.conditions IS DISTINCT FROM OLD.conditions
      OR NEW.emitted_at IS DISTINCT FROM OLD.emitted_at
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'FACTURE_EMISE: contenu historique conservé — les corrections passent par un avoir';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Permissions devis pour le poste Accueil & caisse (parcours continu
--    client → dossier → devis → facture). facture.create déjà accordé (094).
INSERT INTO public.role_permissions (role, permission)
SELECT 'accueil_caisse', p.permission
FROM (VALUES
  ('devis.create'),
  ('devis.send')
) AS p(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp
  WHERE rp.role = 'accueil_caisse' AND rp.permission = p.permission
);

-- 4. Prestations guichet demandées, absentes de 089. Aucun tarif inventé.
INSERT INTO public.services (slug, nom, categorie, tarif_type, status, visibilite_publique, ordre_affichage)
VALUES
  ('impressions', 'Impressions', 'Services de proximite', 'sur_devis', 'actif', false, -10),
  ('repassage',   'Repassage',   'Services de proximite', 'sur_devis', 'actif', false, -10)
ON CONFLICT (slug) DO NOTHING;
