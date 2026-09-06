-- P6-0 etape 4, lot 4.1 : debloque l'ecriture de paiements.
--
-- 1. payments_check_transition() exigeait client_id (-> profiles) et
--    dossier_id (-> demandes) non nuls a l'insertion -- incompatible avec
--    un client sans compte ou un paiement non rattache a un dossier
--    precis (usage reel du formulaire staff). Les deux deviennent
--    optionnels ; client_record_id (-> clients, A6) reste le vrai
--    rattachement client. method/amount/amount_xaf restent exiges.
--
-- 2. calculate_payment_status() ne derivait que statut (francais) depuis
--    montant_recu/montant_total. Etend pour deriver aussi status, amount,
--    amount_xaf et method (traduit depuis mode_paiement) -- sens legacy
--    vers canonique, symetrique du trigger canonique vers legacy pose en
--    etape 3 (trg_payments_sync_status_to_legacy), sans creer de boucle :
--    les deux triggers sont scopes sur des colonnes disjointes du meme
--    UPDATE.
--
-- 3. Postgres execute les triggers BEFORE de meme type dans l'ordre
--    alphabetique de leur nom. Le trigger de verification
--    ('payments_transition_check', prefixe 'p') s'executait avant celui
--    qui derive amount/method/status ('trg_payments_calculate_status',
--    prefixe 't') -- il aurait donc toujours vu ces colonnes vides sur un
--    INSERT et continue de lever une exception malgre le lot 4.1. Renomme
--    en 'trg_payments_transition_check' pour qu'il s'execute apres
--    ('trg_payments_c...' < 'trg_payments_t...' alphabetiquement).

CREATE OR REPLACE FUNCTION payments_check_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  is_legacy boolean := COALESCE((OLD.metadata->>'legacy')::boolean, false);
BEGIN
  IF TG_OP = 'INSERT' THEN
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
$function$;

CREATE OR REPLACE FUNCTION calculate_payment_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  -- Ecrivain canonique pur (aucune colonne francaise fournie) : ne pas
  -- deriver depuis des colonnes vides, laisser status/amount/method tels
  -- que fournis. Protection defensive, aucun ecrivain de ce type n'existe
  -- aujourd'hui (verifie), mais evite une corruption si un futur flux
  -- (webhook Stripe direct sur payments, etc.) ecrit uniquement le
  -- canonique.
  if new.montant_total is null then
    return new;
  end if;

  -- Ne pas ecraser si statut explicitement a 'rembourse' ou 'annule'
  if new.statut in ('rembourse', 'annule') then
    return new;
  end if;

  if new.montant_recu <= 0 then
    new.statut = 'non_paye';
    new.status = 'pending';
  elsif new.montant_recu >= new.montant_total then
    new.statut = 'paye';
    new.montant_recu = new.montant_total; -- Pas de surplus
    new.status = 'paid';
  else
    new.statut = 'partiel';
    new.status = 'partial';
  end if;

  new.amount = new.montant_recu;
  new.amount_xaf = new.montant_recu;
  new.currency = coalesce(new.devise, 'XAF');

  new.method = case new.mode_paiement
    when 'carte' then 'card'::payment_method
    when 'autre' then 'other'::payment_method
    else new.mode_paiement
  end;

  return new;
end;
$function$;

DROP TRIGGER payments_transition_check ON payments;
CREATE TRIGGER trg_payments_transition_check
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION payments_check_transition();
