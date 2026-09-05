-- ============================================================================
-- 033 — HOTFIX SÉCURITÉ (Phase 1a du Plan V3 révisé)
-- Additive uniquement. Aucun DROP de table ni de colonne.
-- Référence : NEXUS_RCA_V3_PHASE1_SECURITE.md, docs/RLS_ETAT_REEL.md
--
-- Corrige 2 failles confirmées par lecture directe de la base (étape 1) :
--   A. profiles       : un utilisateur pouvait modifier sa propre colonne
--                        `role` (aucun trigger, aucune contrainte ne l'en
--                        empêchait) — auto-élévation vers super_admin possible.
--   B. payment_links  : policy SELECT "Public can read payment_links by
--                        reference" avait USING (true) — lecture de la table
--                        entière par n'importe qui, authentifié ou non.
--                        La policy UPDATE acceptait aussi n'importe quel
--                        appelant tant que `statut` était dans une liste de
--                        3 valeurs, sans vérification d'identité.
-- ============================================================================


-- ============================================================================
-- A. PROFILES — bloquer l'auto-élévation de rôle
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_self_elevation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Les écritures faites avec la clé service_role (webhooks, scripts
  -- d'administration, futur back-office RH d'affectation de rôle une fois
  -- migré côté serveur) ne passent pas par auth.uid() de la même façon et
  -- doivent rester possibles.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
      RAISE EXCEPTION 'Modification du role non autorisee'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_profiles_prevent_role_self_elevation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_elevation();

-- NB : la policy "Users can update own profile" (USING auth.uid() = id) N'EST
-- PAS supprimée — elle reste nécessaire pour que chacun modifie son nom,
-- téléphone, avatar. C'est ce trigger, et lui seul, qui protège désormais la
-- colonne `role`. Un utilisateur non super_admin qui tente de changer son
-- role reçoit une exception Postgres (42501) au lieu d'un succès silencieux.


-- ============================================================================
-- B. PAYMENT_LINKS — refermer la lecture publique et resserrer l'écriture
-- ============================================================================

-- B.1 Supprimer la policy SELECT ouverte à tous
DROP POLICY IF EXISTS "Public can read payment_links by reference" ON public.payment_links;

-- B.2 Couper l'accès au niveau GRANT pour le rôle anon (au-delà des policies,
-- ceinture et bretelles : même une policy mal écrite plus tard ne pourra pas
-- exposer la table à un visiteur non authentifié).
REVOKE SELECT ON public.payment_links FROM anon;

-- B.3 Remplacer par deux policies scopées : staff (dashboard interne) et
-- client authentifié lisant SES PROPRES liens (utilisé par
-- app/dashboard/client/demandes/[id]/page.tsx). Le grand public non
-- authentifié n'a plus aucun accès RLS à cette table : la page /payer/[reference]
-- est rebranchée sur un accès service_role côté serveur, avec une sélection de
-- colonnes minimale (voir app/api/payment-links/[reference]/route.ts).
CREATE POLICY "Staff can read payment_links" ON public.payment_links
  FOR SELECT
  USING (is_staff(auth.uid()));

CREATE POLICY "client_read_own_payment_links" ON public.payment_links
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR lower(trim(client_email)) = (
      SELECT lower(trim(profiles.email)) FROM profiles WHERE profiles.id = auth.uid()
    )
  );

-- B.4 Resserrer l'UPDATE : l'ancienne policy autorisait quiconque à modifier
-- une ligne dès lors que son statut était en_attente/en_cours/paiement_declare,
-- SANS vérification d'identité — combinée à la lecture publique désormais
-- fermée, c'était une policy d'écriture ouverte. La déclaration de paiement
-- (POST /api/payment-links/[reference]/declare) passe désormais par la clé
-- service_role côté serveur (toute la validation métier — méthode valide,
-- numéro de transaction, expiration, statut — reste dans le code de la route,
-- inchangée). Le seul chemin RLS restant est le staff (vérification, annulation).
DROP POLICY IF EXISTS "Update payment_links" ON public.payment_links;

CREATE POLICY "Staff can update payment_links" ON public.payment_links
  FOR UPDATE
  USING (is_staff(auth.uid()));

-- Policies non touchées, toujours en place :
--   "Staff can create payment_links"        (INSERT, staff)
--   "Only super_admin can delete payment_links" (DELETE, super_admin)
