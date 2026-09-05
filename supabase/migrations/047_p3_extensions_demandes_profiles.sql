-- ============================================================================
-- 047 — P3 : extension de demandes et profiles
--
-- Additif pur : colonnes nullables ou avec DEFAULT, aucune donnee existante
-- touchee. service_id ajoute maintenant que services existe (migration 044).
-- ============================================================================

-- priority volontairement omis : demandes.urgence existe deja (enum
-- faible/normale/elevee/critique), meme concept, meme granularite. Meme
-- correctif que pour profiles.is_active ci-dessous — verifie avant d'agir
-- plutot que d'appliquer la feuille de route a la lettre.
-- amount_estimated conserve : demandes.budget_estimatif (text, plage libre
-- saisie par le client) n'est pas le meme usage qu'une estimation numerique
-- interne pour le pipeline — proche mais pas un doublon.
ALTER TABLE public.demandes
  ADD COLUMN deadline timestamptz,
  ADD COLUMN service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN amount_estimated numeric,
  ADD COLUMN archived_at timestamptz;

-- is_active volontairement omis : profiles.actif existe deja et couvre le
-- meme role (booleen actif/inactif) — l'ajouter aurait recree exactement le
-- doublon de colonnes que C0 vient de diagnostiquer sur demandes.client_id/
-- client_record_id. La feuille de route a ete ecrite sans verifier l'etat
-- reel du schema ; corrige ici plutot que d'appliquer a la lettre.
ALTER TABLE public.profiles
  ADD COLUMN service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN availability_status text NOT NULL DEFAULT 'disponible' CHECK (availability_status IN ('disponible', 'occupe', 'absent'));
