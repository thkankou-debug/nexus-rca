-- ============================================================================
-- 038 — gen_demande_ref() : MAX(...)+1 → vraie séquence Postgres (P1c point 4)
-- Additive uniquement. Format DEM-YYYY-NNNNNN conservé à l'identique — une
-- référence est un identifiant que le client cite au téléphone.
--
-- Séquence initialisée au maximum actuel (19 au 5 septembre 2026), donc le
-- prochain numéro généré sera 000020. Ancien mécanisme : recalcul par
-- MAX(SUBSTRING(...))::integer + 1 à chaque insertion, sujet à une race
-- condition sous forte concurrence (atténuée jusqu'ici par la contrainte
-- UNIQUE sur demandes.reference, qui faisait échouer l'insert concurrent au
-- lieu de corrompre des données — mais un échec d'insertion visible par un
-- client reste un défaut).
-- ============================================================================

CREATE SEQUENCE public.demande_ref_seq START WITH 20;

CREATE OR REPLACE FUNCTION public.gen_demande_ref()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_year integer;
  next_seq integer;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::integer;
  next_seq := nextval('public.demande_ref_seq');
  RETURN 'DEM-' || current_year || '-' || LPAD(next_seq::text, 6, '0');
END;
$function$;
