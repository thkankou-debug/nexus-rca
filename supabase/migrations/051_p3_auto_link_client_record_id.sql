-- ============================================================================
-- 051 — P3 : auto_link_demande_to_client() peuple aussi client_record_id
-- (prevu par C0 §7 — le trigger ne touchait jusqu'ici que client_id)
--
-- Comportement client_id inchange. Ajoute : une fois client_id resolu (deja
-- fourni ou trouve par correspondance d'e-mail), cherche la fiche clients
-- liee a ce profil ; si aucune n'existe, la cree (meme forme que le
-- backfill de la migration 050) plutot que de laisser client_record_id
-- orphelin pour toute nouvelle demande.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_link_demande_to_client()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  resolved_client_id uuid;
BEGIN
  resolved_client_id := NEW.client_id;

  IF resolved_client_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT id INTO resolved_client_id
    FROM public.profiles
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    LIMIT 1;
    NEW.client_id := resolved_client_id;
  END IF;

  IF NEW.client_record_id IS NULL AND resolved_client_id IS NOT NULL THEN
    SELECT id INTO NEW.client_record_id
    FROM public.clients
    WHERE profile_id = resolved_client_id
    LIMIT 1;

    IF NEW.client_record_id IS NULL THEN
      INSERT INTO public.clients (type, nom, prenom, email, telephone, pays, profile_id)
      SELECT 'particulier', p.nom, p.prenom, p.email, p.telephone, p.pays, p.id
      FROM public.profiles p
      WHERE p.id = resolved_client_id
      RETURNING id INTO NEW.client_record_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
