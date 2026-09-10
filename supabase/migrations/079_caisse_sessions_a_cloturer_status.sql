-- ============================================================================
-- 079 — Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md,
-- §3.3/§4.3, 10/09/2026) : nouveau statut intermédiaire "a_cloturer" pour
-- caisse_sessions.status, entre "ouverte" (caissière travaille) et
-- "cloturee" (validée par DAF/admin).
--
-- Trouvé en testant la migration de données avant tout code applicatif
-- (transaction ROLLBACK) : caisse_sessions_status_check limitait déjà
-- status à ('ouverte', 'cloturee') — la présentation initiale de ce lot
-- supposait à tort une colonne texte libre sans contrainte. Corrigé ici
-- avant d'écrire les routes API, pas après.
-- ============================================================================

ALTER TABLE public.caisse_sessions DROP CONSTRAINT caisse_sessions_status_check;

ALTER TABLE public.caisse_sessions
  ADD CONSTRAINT caisse_sessions_status_check
  CHECK (status = ANY (ARRAY['ouverte'::text, 'a_cloturer'::text, 'cloturee'::text]));
