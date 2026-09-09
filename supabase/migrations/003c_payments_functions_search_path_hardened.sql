-- Recupere le 08/09/2026 depuis supabase_migrations.schema_migrations
-- (version 20260504220657) : applique en base le 04/05/2026, jamais
-- committe en fichier .sql jusqu'ici. Texte exact, non reconstruit.

-- Phase 5 step C : durcissement sécu — fixer search_path des 3 fonctions
-- ajoutées par 003b. Mitigation du warning function_search_path_mutable.

CREATE OR REPLACE FUNCTION public.payments_set_updated_at() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.payments_check_transition() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $func$
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

CREATE OR REPLACE FUNCTION public.payments_log_event() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $func$
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
