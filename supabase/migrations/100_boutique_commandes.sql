-- ============================================================================
-- 100 — Module commercial phase 1 (GO 21/09/2026)
-- Catalogue public = table `services` existante (visibilite_publique).
-- Nouvelles tables : boutique_commandes + lignes. Additive, non destructive.
-- Une commande transmise n'est PAS un encaissement : status='transmise',
-- jamais 'payee' ici. Rattachement devis/facture/paiement prévu (FK null).
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.boutique_commande_ref_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.gen_boutique_commande_ref()
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
  next_seq := nextval('public.boutique_commande_ref_seq');
  RETURN 'NXB-' || current_year || '-' || LPAD(next_seq::text, 6, '0');
END;
$function$;

REVOKE ALL ON FUNCTION public.gen_boutique_commande_ref() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gen_boutique_commande_ref() TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.boutique_commande_ref_seq TO authenticated;

CREATE TABLE public.boutique_commandes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  client_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'transmise'
    CHECK (status IN ('transmise', 'en_traitement', 'annulee', 'facturee', 'payee')),
  total_xaf numeric NOT NULL CHECK (total_xaf > 0),
  devise text NOT NULL DEFAULT 'XAF',
  notes_client text,
  -- Rattachement au circuit existant — jamais remplis à la création.
  devis_id uuid REFERENCES public.devis(id) ON DELETE SET NULL,
  facture_id uuid REFERENCES public.factures(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_commandes_client ON public.boutique_commandes(client_id);
CREATE INDEX idx_boutique_commandes_status ON public.boutique_commandes(status);
CREATE INDEX idx_boutique_commandes_is_test
  ON public.boutique_commandes(is_test) WHERE is_test = true;

CREATE TRIGGER trg_boutique_commandes_updated_at
  BEFORE UPDATE ON public.boutique_commandes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.boutique_commande_lignes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id uuid NOT NULL REFERENCES public.boutique_commandes(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  slug text NOT NULL,
  titre text NOT NULL,
  tarif_type text NOT NULL,
  prix_unitaire_xaf numeric NOT NULL CHECK (prix_unitaire_xaf >= 0),
  quantite integer NOT NULL CHECK (quantite > 0 AND quantite <= 99),
  montant_xaf numeric NOT NULL CHECK (montant_xaf >= 0),
  ordre int NOT NULL DEFAULT 0
);

CREATE INDEX idx_boutique_commande_lignes_commande
  ON public.boutique_commande_lignes(commande_id);

ALTER TABLE public.boutique_commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_commande_lignes ENABLE ROW LEVEL SECURITY;

-- Lecture : le client ne voit que les siennes.
CREATE POLICY "Client reads own boutique commandes"
  ON public.boutique_commandes FOR SELECT
  USING (client_id = (SELECT auth.uid()));

CREATE POLICY "Staff reads boutique commandes"
  ON public.boutique_commandes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role IN (
          'agent', 'admin', 'super_admin', 'dg', 'daf',
          'chef_service', 'comptable', 'accueil_caisse'
        )
    )
  );

-- Pas d'INSERT/UPDATE/DELETE client direct : uniquement la RPC ci-dessous
-- (prix recalculés serveur). Staff peut annoter le statut, jamais 'payee'
-- sans un paiement réel (contrainte applicative phase 1 : l'UI ne propose
-- que transmise → en_traitement / annulee).
CREATE POLICY "Staff updates boutique commande status"
  ON public.boutique_commandes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role IN ('agent', 'admin', 'super_admin', 'accueil_caisse')
    )
  )
  WITH CHECK (status IN ('transmise', 'en_traitement', 'annulee', 'facturee', 'payee'));

CREATE POLICY "Client reads own boutique lignes"
  ON public.boutique_commande_lignes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boutique_commandes c
      WHERE c.id = commande_id AND c.client_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Staff reads boutique lignes"
  ON public.boutique_commande_lignes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role IN (
          'agent', 'admin', 'super_admin', 'dg', 'daf',
          'chef_service', 'comptable', 'accueil_caisse'
        )
    )
  );

-- Transmission atomique : auth.uid() imposé, prix lus en base, status fixé.
CREATE OR REPLACE FUNCTION public.submit_boutique_commande(
  p_items jsonb,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_is_test boolean := false;
  v_total numeric := 0;
  v_id uuid;
  v_ref text;
  v_item jsonb;
  v_slug text;
  v_qty integer;
  v_svc record;
  v_index integer := 0;
  v_len integer;
  v_i integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Panier vide';
  END IF;
  v_len := jsonb_array_length(p_items);
  IF v_len > 20 THEN
    RAISE EXCEPTION 'Maximum 20 lignes par commande';
  END IF;

  SELECT COALESCE(is_test, false) INTO v_is_test
  FROM public.profiles WHERE id = v_uid;

  FOR v_i IN 0 .. v_len - 1 LOOP
    v_item := p_items -> v_i;
    v_slug := btrim(COALESCE(v_item->>'slug', ''));
    BEGIN
      v_qty := (v_item->>'quantite')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Quantité invalide';
    END;
    IF v_slug = '' OR v_qty IS NULL OR v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'Ligne invalide';
    END IF;

    SELECT id, slug, nom, tarif_type, tarif_montant
      INTO v_svc
      FROM public.services
     WHERE slug = v_slug
       AND status = 'actif'
       AND visibilite_publique = true;

    IF v_svc.id IS NULL THEN
      RAISE EXCEPTION 'Offre indisponible (%)', v_slug;
    END IF;
    IF v_svc.tarif_type IS DISTINCT FROM 'fixe'
       OR v_svc.tarif_montant IS NULL
       OR v_svc.tarif_montant <= 0 THEN
      RAISE EXCEPTION 'Cette offre n''est pas achetable en ligne : %', v_svc.nom;
    END IF;
    v_total := v_total + (v_svc.tarif_montant * v_qty);
  END LOOP;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Total invalide';
  END IF;

  v_ref := public.gen_boutique_commande_ref();

  INSERT INTO public.boutique_commandes (
    reference, client_id, status, total_xaf, devise, notes_client, is_test
  ) VALUES (
    v_ref, v_uid, 'transmise', v_total, 'XAF',
    NULLIF(btrim(COALESCE(p_notes, '')), ''),
    v_is_test
  )
  RETURNING id INTO v_id;

  FOR v_i IN 0 .. v_len - 1 LOOP
    v_item := p_items -> v_i;
    v_slug := btrim(v_item->>'slug');
    v_qty := (v_item->>'quantite')::integer;
    SELECT id, slug, nom, tarif_type, tarif_montant
      INTO v_svc
      FROM public.services
     WHERE slug = v_slug;

    INSERT INTO public.boutique_commande_lignes (
      commande_id, service_id, slug, titre, tarif_type,
      prix_unitaire_xaf, quantite, montant_xaf, ordre
    ) VALUES (
      v_id, v_svc.id, v_svc.slug, v_svc.nom, v_svc.tarif_type,
      v_svc.tarif_montant, v_qty, v_svc.tarif_montant * v_qty, v_index
    );
    v_index := v_index + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_id,
    'reference', v_ref,
    'total_xaf', v_total,
    'status', 'transmise',
    'devise', 'XAF'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_boutique_commande(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_boutique_commande(jsonb, text) TO authenticated;

INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'boutique.order.read'),
  ('super_admin', 'boutique.order.read'),
  ('agent', 'boutique.order.read'),
  ('accueil_caisse', 'boutique.order.read'),
  ('dg', 'boutique.order.read'),
  ('daf', 'boutique.order.read')
ON CONFLICT (role, permission) DO NOTHING;

COMMENT ON TABLE public.boutique_commandes IS
  'Commandes boutique phase 1. status transmise = non payée. Jamais un chiffre d''affaires.';
