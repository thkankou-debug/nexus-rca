-- Recupere le 08/09/2026 depuis supabase_migrations.schema_migrations
-- (version 20260504215803) : applique en base le 04/05/2026, jamais
-- committe en fichier .sql jusqu'ici. Texte exact, non reconstruit.
-- Prérequis : 003a appliquée (les nouvelles valeurs d'enum sont visibles).

-- ─── 1. Nouvelles colonnes sur payments ────────────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS dossier_id        uuid REFERENCES public.demandes(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS method            payment_method,
  ADD COLUMN IF NOT EXISTS status            payment_status,
  ADD COLUMN IF NOT EXISTS validated_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validated_at      timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at           timestamptz,
  ADD COLUMN IF NOT EXISTS voided_at         timestamptz,
  ADD COLUMN IF NOT EXISTS amount            numeric(15, 2),
  ADD COLUMN IF NOT EXISTS amount_xaf        numeric(15, 2),
  ADD COLUMN IF NOT EXISTS currency          text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_id text,
  ADD COLUMN IF NOT EXISTS om_transaction_id text,
  ADD COLUMN IF NOT EXISTS cash_receipt_no   text,
  ADD COLUMN IF NOT EXISTS metadata          jsonb DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_session_id_unique') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_stripe_session_id_unique UNIQUE (stripe_session_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_payment_id_unique') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_stripe_payment_id_unique UNIQUE (stripe_payment_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_om_transaction_id_unique') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_om_transaction_id_unique UNIQUE (om_transaction_id);
  END IF;
END $$;

-- ─── 2. Backfill ───────────────────────────────────────────────────────────

UPDATE public.payments SET dossier_id = demande_id WHERE dossier_id IS NULL AND demande_id IS NOT NULL;

UPDATE public.payments SET method = CASE mode_paiement
  WHEN 'especes'        THEN 'cash'::payment_method
  WHEN 'virement'       THEN 'bank_transfer'::payment_method
  WHEN 'mobile_money'   THEN 'orange_money'::payment_method
  WHEN 'carte'          THEN 'stripe'::payment_method
  WHEN 'western_union'  THEN 'autre'::payment_method
  WHEN 'moneygram'      THEN 'autre'::payment_method
  WHEN 'cheque'         THEN 'autre'::payment_method
  WHEN 'autre'          THEN 'autre'::payment_method
END WHERE method IS NULL AND mode_paiement IS NOT NULL;

UPDATE public.payments SET status = CASE statut
  WHEN 'non_paye'   THEN 'pending'::payment_status
  WHEN 'partiel'    THEN 'paid'::payment_status
  WHEN 'paye'       THEN 'paid'::payment_status
  WHEN 'rembourse'  THEN 'refunded'::payment_status
  WHEN 'annule'     THEN 'voided'::payment_status
END WHERE status IS NULL AND statut IS NOT NULL;

UPDATE public.payments SET
  amount     = COALESCE(amount, montant_total),
  currency   = COALESCE(currency, devise, 'XAF'),
  amount_xaf = COALESCE(amount_xaf, montant_total),
  paid_at    = COALESCE(paid_at, CASE WHEN statut IN ('partiel','paye') THEN COALESCE(date_paiement, created_at) ELSE NULL END)
WHERE amount IS NULL OR currency IS NULL OR amount_xaf IS NULL;

UPDATE public.payments
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('legacy', true, 'migrated_at', now())
WHERE (client_id IS NULL OR dossier_id IS NULL)
  AND (metadata IS NULL OR NOT (metadata ? 'legacy'));

-- ─── 3. Tables auxiliaires ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id    uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type    text NOT NULL CHECK (event_type IN (
    'created', 'paid', 'failed', 'validated', 'refunded', 'voided', 'note_updated'
  )),
  from_status   payment_status,
  to_status     payment_status,
  actor_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_kind    text NOT NULL DEFAULT 'user' CHECK (actor_kind IN ('user', 'webhook', 'system')),
  payload       jsonb DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON public.payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON public.payment_events(created_at DESC);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_events_select ON public.payment_events;
CREATE POLICY payment_events_select ON public.payment_events FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_log (
  id            text PRIMARY KEY,
  event_type    text NOT NULL,
  payload       jsonb NOT NULL,
  processed     boolean NOT NULL DEFAULT false,
  processed_at  timestamptz,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_log_processed ON public.stripe_webhook_log(processed, created_at);

ALTER TABLE public.stripe_webhook_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stripe_webhook_log_select ON public.stripe_webhook_log;
CREATE POLICY stripe_webhook_log_select ON public.stripe_webhook_log FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'super_admin')
);

-- ─── 4. Indexes ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_payments_dossier_id   ON public.payments(dossier_id);
CREATE INDEX IF NOT EXISTS idx_payments_status       ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method       ON public.payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at      ON public.payments(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_validated_by ON public.payments(validated_by) WHERE validated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_stripe_sess  ON public.payments(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- ─── 5. Triggers ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.payments_set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_set_updated_at();

CREATE OR REPLACE FUNCTION public.payments_check_transition() RETURNS trigger
LANGUAGE plpgsql AS $func$
DECLARE
  is_legacy boolean := COALESCE((OLD.metadata->>'legacy')::boolean, false);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.client_id IS NULL THEN
      RAISE EXCEPTION 'payments.client_id is required for new payments';
    END IF;
    IF NEW.dossier_id IS NULL THEN
      RAISE EXCEPTION 'payments.dossier_id is required for new payments';
    END IF;
    IF NEW.method IS NULL THEN
      RAISE EXCEPTION 'payments.method is required for new payments';
    END IF;
    IF NEW.status IS NULL THEN
      NEW.status = 'pending';
    END IF;
    IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
      RAISE EXCEPTION 'payments.amount must be positive';
    END IF;
    IF NEW.amount_xaf IS NULL OR NEW.amount_xaf <= 0 THEN
      RAISE EXCEPTION 'payments.amount_xaf must be positive';
    END IF;
    IF NEW.currency IS NULL THEN
      NEW.currency = 'XAF';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF is_legacy AND OLD.status IS NULL THEN
      RETURN NEW;
    END IF;

    IF OLD.status IN ('voided', 'refunded')
       AND NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.status;
    END IF;

    IF OLD.status = 'validated'
       AND NEW.status NOT IN ('validated', 'refunded', 'voided') THEN
      RAISE EXCEPTION 'Validated payment can only transition to refunded or voided (got %)', NEW.status;
    END IF;

    IF NEW.validated_by IS NOT NULL
       AND NEW.validated_by = OLD.created_by THEN
      RAISE EXCEPTION 'Self-validation forbidden: validator (%) must differ from creator', NEW.validated_by;
    END IF;

    IF NEW.status = 'validated' AND OLD.status IS DISTINCT FROM 'validated' THEN
      IF NEW.validated_by IS NULL THEN
        RAISE EXCEPTION 'validated_by required when status=validated';
      END IF;
      IF NEW.validated_at IS NULL THEN
        NEW.validated_at = now();
      END IF;
    END IF;

    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
      IF NEW.paid_at IS NULL THEN
        NEW.paid_at = now();
      END IF;
    END IF;

    IF NEW.status = 'voided' AND OLD.status IS DISTINCT FROM 'voided' THEN
      IF NEW.voided_at IS NULL THEN
        NEW.voided_at = now();
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS payments_transition_check ON public.payments;
CREATE TRIGGER payments_transition_check BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_check_transition();

CREATE OR REPLACE FUNCTION public.payments_log_event() RETURNS trigger
LANGUAGE plpgsql AS $func$
DECLARE
  evt_type text;
  actor uuid := auth.uid();
  actor_k text := CASE WHEN auth.uid() IS NULL THEN 'system' ELSE 'user' END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.payment_events (payment_id, event_type, from_status, to_status, actor_id, actor_kind)
    VALUES (NEW.id, 'created', NULL, NEW.status, actor, actor_k);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    evt_type := CASE NEW.status
      WHEN 'paid'      THEN 'paid'
      WHEN 'failed'    THEN 'failed'
      WHEN 'validated' THEN 'validated'
      WHEN 'refunded'  THEN 'refunded'
      WHEN 'voided'    THEN 'voided'
      ELSE 'note_updated'
    END;
    INSERT INTO public.payment_events (payment_id, event_type, from_status, to_status, actor_id, actor_kind)
    VALUES (NEW.id, evt_type, OLD.status, NEW.status, actor, actor_k);
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS payments_event_logger ON public.payments;
CREATE TRIGGER payments_event_logger AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_log_event();

-- ─── 6. RLS policies ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS payments_select       ON public.payments;
DROP POLICY IF EXISTS payments_insert       ON public.payments;
DROP POLICY IF EXISTS payments_update       ON public.payments;
DROP POLICY IF EXISTS payments_delete       ON public.payments;
DROP POLICY IF EXISTS payments_validate     ON public.payments;
DROP POLICY IF EXISTS payments_update_notes ON public.payments;
DROP POLICY IF EXISTS payments_destructive  ON public.payments;
DROP POLICY IF EXISTS payments_no_delete    ON public.payments;

CREATE POLICY payments_select ON public.payments FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
  OR created_by = auth.uid()
  OR client_id  = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.demandes d
    WHERE d.id = payments.dossier_id
      AND d.agent_id = auth.uid()
  )
);

CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin', 'agent'))
  AND created_by = auth.uid()
);

CREATE POLICY payments_update ON public.payments FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
);

CREATE POLICY payments_update_notes ON public.payments FOR UPDATE USING (
  created_by = auth.uid()
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'agent')
);

CREATE POLICY payments_no_delete ON public.payments FOR DELETE USING (false);

-- ─── 7. Comments ───────────────────────────────────────────────────────────

COMMENT ON COLUMN public.payments.dossier_id IS
  'Dossier rattaché (= demande_id, NOT NULL pour nouveaux paiements). Required.';
COMMENT ON COLUMN public.payments.method IS
  'Méthode de paiement unifiée. Required pour nouveaux paiements.';
COMMENT ON COLUMN public.payments.status IS
  'Statut du cycle de vie. pending → paid → validated, ou refunded/voided.';
COMMENT ON COLUMN public.payments.validated_by IS
  'Validateur (admin+). Doit différer de created_by (séparation des pouvoirs).';
COMMENT ON COLUMN public.payments.amount_xaf IS
  'Montant équivalent FCFA gelé à la création. Source unique pour reporting.';
COMMENT ON COLUMN public.payments.metadata IS
  'Payload JSON : { legacy: bool, stripe_payload?, om_payload?, … }';

COMMENT ON TABLE public.payment_events IS
  'Audit log immuable du cycle de vie de chaque paiement. Lecture admin+.';
COMMENT ON TABLE public.stripe_webhook_log IS
  'Idempotence des webhooks Stripe (id = stripe event id, UNIQUE).';
