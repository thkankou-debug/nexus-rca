-- ============================================================================
-- 037 — RATE-LIMITING PAR FENÊTRE GLISSANTE (Phase 1b, point 9)
-- Additive uniquement.
--
-- Table dédiée, écrite/lue uniquement par service_role (voir lib/rate-limit.ts).
-- RLS activée sans aucune policy : deny-all par défaut pour anon/authenticated,
-- conforme à la règle "toute nouvelle table : RLS activée dans la même
-- migration que sa création".
-- ============================================================================

CREATE TABLE public.rate_limit_hits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rl_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_hits_key_created ON public.rate_limit_hits(rl_key, created_at);

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
-- Aucune policy : deny-all pour anon/authenticated. service_role bypass RLS.
