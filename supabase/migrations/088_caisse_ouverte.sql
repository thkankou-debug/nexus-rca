-- ============================================================================
-- 088 — PHASE « CAISSE OUVERTE » (docs/ADDENDUM_CAISSE_OUVERTE.md, GO
-- Thierry 12/09/2026 ; décision : la réceptionniste rembourse la caution
-- elle-même, traçabilité complète). Migration additive unique de la phase.
--
-- G7 · quick_sales.is_test — même règle L2 que les 8 tables couvertes par
--   la migration 074 (comptes TEST → données de test, filtrées des
--   agrégats réels), manquait sur cette table.
--
-- G3 · quick_sales.nature — prestation (défaut) | caution |
--   caution_remboursement. Une caution ENTRE dans le tiroir (espèces
--   théoriques) mais n'est JAMAIS une recette ; son remboursement est un
--   mouvement compensatoire SORTANT, stocké en montant positif
--   (CHECK montant_total >= 0 existant conservé) et SOUSTRAIT partout où
--   les espèces sont sommées. caution_ref → ligne caution d'origine :
--   le remboursement est lié et borné (contrôle route + recette SQL).
--
-- G2 · pos_credits — 1 ligne = 1 créance de comptoir (ticket partiellement
--   réglé). Le détail des prestations vit ici (lignes jsonb) ; chaque
--   règlement (acompte initial puis compléments) est une ligne quick_sales
--   du MONTANT PAYÉ reliée par credit_id — le tiroir et les recettes ne
--   comptent que l'argent réellement reçu, jamais le dû. total_regle est
--   maintenu par verrou optimiste (update conditionnel sur l'ancienne
--   valeur, R09) et borné par contrainte. Jamais supprimée.
--
-- G5 · services.visibilite_publique — un service peut être vendu à
--   l'agence sans être publié sur le site. Backfill TRUE = comportement
--   public actuel inchangé. La policy publique exige désormais actif ET
--   publique ; le staff (policy manage) et le POS (service-role) voient
--   tout ce qui est actif.
-- ============================================================================

-- G7
ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_quick_sales_is_test
  ON public.quick_sales(is_test) WHERE is_test = true;

-- G3
ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS nature text NOT NULL DEFAULT 'prestation'
    CHECK (nature IN ('prestation', 'caution', 'caution_remboursement')),
  ADD COLUMN IF NOT EXISTS caution_ref uuid REFERENCES public.quick_sales(id);
CREATE INDEX IF NOT EXISTS idx_quick_sales_caution_ref
  ON public.quick_sales(caution_ref) WHERE caution_ref IS NOT NULL;

-- G2
CREATE TABLE public.pos_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_key uuid NOT NULL UNIQUE,
  client_record_id uuid REFERENCES public.clients(id),
  demande_id uuid REFERENCES public.demandes(id),
  client_nom text,
  lignes jsonb NOT NULL, -- [{label, quantite, prix_unitaire, montant_total}]
  total_du numeric NOT NULL CHECK (total_du > 0),
  total_regle numeric NOT NULL DEFAULT 0 CHECK (total_regle >= 0),
  status text NOT NULL DEFAULT 'ouverte' CHECK (status IN ('ouverte', 'soldee')),
  is_test boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pos_credits_regle_borne CHECK (total_regle <= total_du)
);
CREATE INDEX idx_pos_credits_status ON public.pos_credits(status);
CREATE INDEX idx_pos_credits_client ON public.pos_credits(client_record_id)
  WHERE client_record_id IS NOT NULL;
CREATE TRIGGER trg_pos_credits_updated_at
  BEFORE UPDATE ON public.pos_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.pos_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read pos_credits" ON public.pos_credits
  FOR SELECT USING (is_staff((SELECT auth.uid())));
-- Écritures : routes service-role uniquement (SEC-01, refus par défaut).

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS credit_id uuid REFERENCES public.pos_credits(id);
CREATE INDEX IF NOT EXISTS idx_quick_sales_credit
  ON public.quick_sales(credit_id) WHERE credit_id IS NOT NULL;

-- G5
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS visibilite_publique boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active public services" ON public.services
  FOR SELECT USING (status = 'actif' AND visibilite_publique = true);

COMMENT ON COLUMN public.services.visibilite_publique IS
  'Caisse ouverte (addendum 12/09/2026) : false = prestation interne, vendable au POS mais jamais publiée sur le site.';
