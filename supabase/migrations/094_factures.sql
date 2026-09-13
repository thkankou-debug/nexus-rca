-- ============================================================================
-- 094 — FACTURES (cahier « reprise Accueil & caisse » §8-§9, 12/09/2026)
-- La facture décrit ce que le client doit payer ; le reçu atteste le
-- paiement. Une facture peut être émise avant règlement, recevoir plusieurs
-- règlements (chacun produit son reçu via quick_sales.invoice_id), et n'est
-- « réglée » que si les paiements le justifient.
--
-- Garanties structurelles :
--   · référence unique auto (FAC-AAAA-NNNNNN / AVR-AAAA-NNNNNN) ;
--   · une facture ÉMISE conserve son contenu historique : les champs de
--     contenu sont FIGÉS par trigger (FACTURE_EMISE), les corrections
--     passent par un AVOIR tracé (type='avoir', parent_id, motif) — jamais
--     une réécriture invisible ;
--   · une facture émise ne se supprime pas ;
--   · les règlements passent par la caisse (quick_sales.invoice_id → le
--     trigger 091 exige une session ouverte) — générer une facture depuis
--     une vente déjà enregistrée ne double ni vente ni revenu (la facture
--     référence les ventes du ticket, elle n'en crée pas).
-- Pas de TVA ni de taxe (décision Thierry 12/09/2026) ; NIF/RCCM seront
-- ajoutés plus tard dans lib/facture-config.ts (aucune valeur inventée).
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.invoice_ref_seq;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  type text NOT NULL DEFAULT 'facture' CHECK (type IN ('facture', 'avoir')),
  parent_id uuid REFERENCES public.invoices(id),
  motif text,
  client_record_id uuid REFERENCES public.clients(id),
  client_nom text NOT NULL CHECK (length(btrim(client_nom)) >= 2),
  client_coordonnees text,
  demande_id uuid REFERENCES public.demandes(id),
  ticket_key uuid,
  lignes jsonb NOT NULL,
  total numeric NOT NULL CHECK (total > 0),
  total_regle numeric NOT NULL DEFAULT 0 CHECK (total_regle >= 0 AND total_regle <= total),
  echeance date,
  conditions text,
  status text NOT NULL DEFAULT 'brouillon'
    CHECK (status IN ('brouillon', 'emise', 'partiellement_reglee', 'reglee', 'annulee')),
  emitted_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_test boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_record_id);
CREATE INDEX IF NOT EXISTS idx_invoices_parent ON public.invoices(parent_id);

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id);
CREATE INDEX IF NOT EXISTS idx_quick_sales_invoice ON public.quick_sales(invoice_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Author reads own invoices" ON public.invoices;
CREATE POLICY "Author reads own invoices"
  ON public.invoices FOR SELECT
  USING (created_by = (SELECT auth.uid()));

-- Référence unique auto : FAC-2026-000001 / AVR-2026-000001.
CREATE OR REPLACE FUNCTION public.invoices_set_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference :=
      CASE WHEN NEW.type = 'avoir' THEN 'AVR' ELSE 'FAC' END
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('public.invoice_ref_seq')::text, 6, '0');
  END IF;
  IF NEW.type = 'avoir' THEN
    IF NEW.parent_id IS NULL THEN
      RAISE EXCEPTION 'AVOIR_INVALIDE: un avoir référence toujours la facture corrigée (parent_id)';
    END IF;
    IF NEW.motif IS NULL OR length(btrim(NEW.motif)) < 3 THEN
      RAISE EXCEPTION 'AVOIR_INVALIDE: motif obligatoire — un avoir est un circuit tracé';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoices_reference ON public.invoices;
CREATE TRIGGER trg_invoices_reference
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.invoices_set_reference();

-- Contenu historique conservé : après émission, seuls status / total_regle
-- évoluent (règlements). Tout le reste est figé — corrections par avoir.
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

DROP TRIGGER IF EXISTS trg_invoices_freeze ON public.invoices;
CREATE TRIGGER trg_invoices_freeze
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.invoices_freeze_emitted();

-- Droits : la réceptionniste crée et émet les factures courantes (§8).
INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission
FROM (VALUES ('accueil_caisse'), ('daf'), ('comptable')) AS r(role),
     (VALUES ('facture.create'), ('facture.read')) AS p(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp
  WHERE rp.role = r.role AND rp.permission = p.permission
);
