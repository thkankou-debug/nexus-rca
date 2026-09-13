-- ============================================================================
-- 059 — P6 : numerotation par sequence Postgres pour devis, factures, recus
-- (paiements) — jamais par count(*)+1, format DEV-/FAC-/REC-YYYY-NNNNNN.
--
-- devis et factures (P3, migration 045) n'ont aucun generateur de reference :
-- ajout complet, meme patron que appointments/payment_links (sequence +
-- LPAD(NEXTVAL(...), 6, '0')).
--
-- payments utilisait generate_payment_reference() avec un suffixe aleatoire
-- md5(random()) et le prefixe PAY- (000_schema_baseline.sql) : remplace par
-- une vraie sequence et le prefixe REC- (decision Thierry, 06/09/2026) — un
-- "recu" est concretement le PDF genere depuis une ligne payments
-- (PaymentReceipt.tsx, migre en pdf-lib au lot P6/D5). Les paiements reels
-- existants gardent leur reference PAY- actuelle : non renumerotes. Le
-- trigger trg_payments_generate_ref (baseline) continue d'appeler cette
-- meme fonction, aucune modification du trigger necessaire.
-- ============================================================================

CREATE SEQUENCE public.devis_ref_seq;
CREATE SEQUENCE public.factures_ref_seq;
CREATE SEQUENCE public.payments_ref_seq;

CREATE OR REPLACE FUNCTION public.generate_devis_reference()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'DEV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                      LPAD(NEXTVAL('public.devis_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_devis_generate_ref BEFORE INSERT ON public.devis
  FOR EACH ROW EXECUTE FUNCTION generate_devis_reference();

CREATE OR REPLACE FUNCTION public.generate_facture_reference()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'FAC-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                      LPAD(NEXTVAL('public.factures_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_factures_generate_ref BEFORE INSERT ON public.factures
  FOR EACH ROW EXECUTE FUNCTION generate_facture_reference();

CREATE OR REPLACE FUNCTION public.generate_payment_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'REC-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                      LPAD(NEXTVAL('public.payments_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

COMMENT ON COLUMN public.payments.reference IS 'Prefixe REC- par sequence Postgres depuis le 06/09/2026 (P6). Les paiements crees avant cette date portent un prefixe PAY- (suffixe aleatoire md5), non renumerotes — voir docs/DETTE.md.';
