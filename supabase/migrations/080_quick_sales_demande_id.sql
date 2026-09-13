-- ============================================================================
-- 080 — Espace Accueil & Caisse, Comptoir POS (NEXUS_RCA_DASHBOARD_
-- ADMINISTRATION.md §3.2, étape 3 "Dossier") : une vente au comptoir peut
-- être rattachée à un dossier existant ("la prestation entre dans le
-- parcours du client"), sans créer un dossier vide pour chaque photocopie
-- (cas "vente au comptoir" : demande_id reste NULL).
--
-- Additive uniquement : aucune ligne existante modifiée, aucun NOT NULL,
-- aucune policy touchée (les écritures POS passent par une route API
-- service-role gardée par assertPermission('paiement.record') — le rôle
-- accueil_caisse n'est pas couvert par is_staff()/les policies quick_sales,
-- volontairement non élargies ici).
-- ============================================================================

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS demande_id uuid REFERENCES public.demandes(id);

CREATE INDEX IF NOT EXISTS idx_quick_sales_demande_id
  ON public.quick_sales(demande_id);

COMMENT ON COLUMN public.quick_sales.demande_id IS
  'Dossier rattaché (Comptoir POS, étape 3). NULL = vente au comptoir sans suivi.';
