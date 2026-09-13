-- ============================================================================
-- 098 — OUTBOX E-MAILS (cahier Administration §10, lot G3 — 13/09/2026)
-- « Boîte d'envoi transactionnelle » : chaque e-mail émis par l'application
-- est JOURNALISÉ (pending → sent/failed) au point unique lib/email/send.ts ;
-- les échecs sont rejoués par le cron quotidien (5 tentatives max), plus
-- aucun envoi perdu en silence. Écritures via service-role uniquement
-- (RLS activée sans policy client) ; lecture supervision via les routes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'email' CHECK (kind IN ('email')),
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  tag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_outbox_retry ON public.outbox(status) WHERE status <> 'sent';

ALTER TABLE public.outbox ENABLE ROW LEVEL SECURITY;
