-- P6-0 etape 3 : synchronisation temporaire, sens unique (canonique -> herite),
-- pour proteger les consommateurs pas encore migres (etape 4) pendant la
-- transition. Ne synchronise QUE status -> statut : amount -> montant_total
-- est volontairement exclu (decision confirmee) -- amount represente ce qui
-- a ete reellement encaisse, montant_total le prix total du, ce ne sont pas
-- la meme grandeur (voir docs/DETTE.md, P6-0 etape 1).
--
-- validated/failed (retires de l'usage par D6) n'ont pas d'equivalent
-- francais : statut n'est pas modifie si l'un d'eux apparait.

CREATE OR REPLACE FUNCTION sync_payment_status_to_legacy()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  CASE NEW.status
    WHEN 'pending'  THEN NEW.statut = 'non_paye';
    WHEN 'partial'  THEN NEW.statut = 'partiel';
    WHEN 'paid'     THEN NEW.statut = 'paye';
    WHEN 'refunded' THEN NEW.statut = 'rembourse';
    WHEN 'voided'   THEN NEW.statut = 'annule';
    ELSE
      -- validated/failed : pas de valeur francaise correspondante, on ne
      -- touche pas statut.
      NULL;
  END CASE;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_payments_sync_status_to_legacy
  BEFORE INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_status_to_legacy();
