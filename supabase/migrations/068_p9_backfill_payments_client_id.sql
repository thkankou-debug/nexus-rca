-- 068 — P9 (audit confidentialite) : backfill payments.client_id manquant quand
-- un profil existe reellement pour l'email du paiement. RLS payments_select
-- exige client_id = auth.uid() ; sans ce backfill, le client ne voit pas ses
-- propres paiements sur /dashboard/client/paiements malgre le filtre par
-- email cote code (le filtre code n'a aucun effet si RLS bloque la ligne
-- avant meme d'atteindre ce filtre).
-- N'affecte QUE les lignes dont l'email correspond a un profil existant -
-- les paiements de personnes sans compte restent a client_id NULL, ce qui
-- est correct (personne ne peut se connecter pour les voir de toute facon).
-- Idempotent (WHERE client_id IS NULL).
--
-- payment_links a la meme colonne/policy (client_read_own_payment_links),
-- verifie pendant l'audit : les 2 lignes sans client_id n'ont aucun profil
-- correspondant (comptes jamais crees) - rien a backfiller la, la route de
-- creation (app/api/payment-links/create/route.ts) fait deja la recherche
-- par email correctement pour tout nouveau lien.
UPDATE public.payments pm
SET client_id = p.id
FROM public.profiles p
WHERE pm.client_id IS NULL
  AND lower(trim(p.email)) = lower(trim(pm.client_email));
