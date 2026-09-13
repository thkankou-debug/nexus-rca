-- ============================================================================
-- 092 — OUVERTURE DE CAISSE : détails exigés par le cahier §2 (12/09/2026)
-- « L'ouverture enregistre : l'opératrice authentifiée (agent_id, déjà là),
--   le poste de caisse, la date et l'heure (opened_at, déjà là), le fonds
--   d'ouverture réellement compté (opening_balance, déjà là), le détail des
--   coupures si utilisé, une observation éventuelle. »
-- Additif uniquement — aucune donnée existante modifiée.
-- ============================================================================

ALTER TABLE public.caisse_sessions
  ADD COLUMN IF NOT EXISTS poste text NOT NULL DEFAULT 'Réception',
  ADD COLUMN IF NOT EXISTS opening_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS opening_note text;

COMMENT ON COLUMN public.caisse_sessions.poste IS
  'Poste de caisse physique (§2) — Réception par défaut.';
COMMENT ON COLUMN public.caisse_sessions.opening_breakdown IS
  'Détail des coupures comptées à l''ouverture, ex. {"10000":2,"500":6,"pieces":250} — facultatif.';
COMMENT ON COLUMN public.caisse_sessions.opening_note IS
  'Observation libre à l''ouverture — facultatif.';
