-- ============================================================================
-- 035 — payment_links : propriété par client_id, sortie de l'e-mail
-- (Phase 1b, point 6)
-- Additive uniquement.
--
-- Backfill unique : rattacher par correspondance exacte d'e-mail les lignes
-- sans client_id, AVANT de retirer la jointure e-mail de la policy. Vérifié :
-- 2 lignes sur 9 ont client_id NULL, 0 rattachables (aucun profil ne
-- correspond à leur client_email — clients jamais inscrits). Le backfill est
-- donc un no-op aujourd'hui mais s'applique correctement si l'état change
-- avant que cette migration ne soit rejouée sur un environnement de test.
-- ============================================================================

UPDATE public.payment_links pl
SET client_id = p.id
FROM public.profiles p
WHERE pl.client_id IS NULL
  AND lower(trim(p.email)) = lower(trim(pl.client_email));

DROP POLICY IF EXISTS "client_read_own_payment_links" ON public.payment_links;
CREATE POLICY "client_read_own_payment_links" ON public.payment_links
  FOR SELECT
  TO authenticated
  USING (client_id = (SELECT auth.uid()));

-- NB : les 2 lignes non rattachables restent invisibles à leur "propriétaire"
-- via cette policy (elles l'étaient déjà en pratique : sans profil, aucune
-- session authentifiée ne peut de toute façon matcher leur email). Aucune
-- perte d'accès réel pour un compte existant.
