-- ============================================================================
-- 095 — FACTURES DE COMPTOIR : préfixe distinct (correctif de 094)
-- Découverte pendant la phase D : le module « factures de dossier » existant
-- (tables factures/facture_lignes, P6/P9 — devis, dossiers, espace client)
-- numérote déjà en FAC-AAAA-NNNNNN. Les factures de COMPTOIR (table
-- invoices, caisse Accueil) prennent donc FC-AAAA-NNNNNN (avoirs :
-- AV-AAAA-NNNNNN) — deux registres, deux préfixes, aucune référence
-- ambiguë dans l'entreprise. Aucune facture de comptoir n'avait encore été
-- émise hors simulations annulées : pas de renumérotation nécessaire.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invoices_set_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference :=
      CASE WHEN NEW.type = 'avoir' THEN 'AV' ELSE 'FC' END
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('public.invoice_ref_seq')::text, 6, '0');
  END IF;
  IF NEW.type = 'avoir' THEN
    IF NEW.parent_id IS NULL THEN
      RAISE EXCEPTION 'AVOIR_INVALIDE: un avoir référence toujours la facture corrigée (parent_id)';
    END IF;
    IF NEW.motif IS NULL OR length(btrim(NEW.motif)) < 3 THEN
      RAISE EXCEPTION 'AVOIR_INVALIDE: motif obligatoire — un avoir est un circuit tracé';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
