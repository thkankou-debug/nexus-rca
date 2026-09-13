-- ============================================================================
-- 034 — JETON PUBLIC POUR payment_links (Phase 1b, amendement 5)
-- Additive uniquement.
--
-- Motif : la référence PAY-LINK-YYYY-NNNNNN est séquentielle et destinée à
-- être communiquée au client (email, téléphone) — elle n'est pas un secret.
-- L'utiliser comme unique protection de /payer/[reference] permettait
-- l'énumération triviale de tous les liens de paiement. public_token est un
-- identifiant de 32 octets aléatoires (pgcrypto), non déductible, qui devient
-- le seul identifiant utilisable côté page publique.
-- ============================================================================

-- pgcrypto déjà activé (vérifié : schéma extensions) — pas de CREATE EXTENSION nécessaire.

ALTER TABLE public.payment_links
  ADD COLUMN public_token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex');

UPDATE public.payment_links
  SET public_token = encode(extensions.gen_random_bytes(32), 'hex')
  WHERE public_token IS NULL;

CREATE UNIQUE INDEX payment_links_public_token_key ON public.payment_links(public_token);

ALTER TABLE public.payment_links
  ALTER COLUMN public_token SET NOT NULL;
