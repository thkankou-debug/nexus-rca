-- ============================================================================
-- 043b — RBAC 9 ROLES (P2), etape 2/2 : is_staff() etendu, tables de
-- permissions, fonctions, seed initial
--
-- Remplace le modele ordinal (ROLE_RANK/roleAtLeast, toujours en place dans
-- lib/rbac.ts en doublon) par un systeme de permissions granulaires
-- ressource.action[.portee], porte par une table editable sans deploiement
-- de code. A appliquer apres 043a (extension de l'enum, deja committee).
-- ============================================================================

-- ── 1. is_staff() etendu aux nouveaux roles internes ────────────────────────
-- `partenaire` est volontairement exclu : externe, acces restreint par
-- construction (voir matrice ci-dessous — "partages"/"decision seule"), pas
-- le meme niveau de visibilite de base que le personnel interne.
-- is_admin() n'est PAS etendu : c'est precisement le raccourci ordinal que
-- ce chantier remplace par des permissions precises, pas a elargir davantage.
CREATE OR REPLACE FUNCTION public.is_staff(user_id uuid)
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in (
      'agent', 'admin', 'super_admin', 'dg', 'daf', 'chef_service', 'comptable', 'moderateur'
    )
  );
$function$;

-- ── 2. Tables de permissions ─────────────────────────────────────────────
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read role_permissions" ON public.role_permissions
  FOR SELECT USING (is_staff((select auth.uid())));
CREATE POLICY "Super admin manages role_permissions" ON public.role_permissions
  FOR ALL
  USING (get_user_role((select auth.uid())) = 'super_admin')
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

-- Permissions additives par utilisateur (au-dela de son role) — ex. un agent
-- ponctuellement autorise a valider une facture sans devenir daf.
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own permission overrides" ON public.user_permissions
  FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Staff can read user_permissions" ON public.user_permissions
  FOR SELECT USING (is_staff((select auth.uid())));
CREATE POLICY "Super admin manages user_permissions" ON public.user_permissions
  FOR ALL
  USING (get_user_role((select auth.uid())) = 'super_admin')
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

-- ── 3. Fonctions ────────────────────────────────────────────────────────────
-- auth_service_id() differe a P3 : depend de profiles.service_id, qui n'existe
-- pas encore (P3 : "Profils | ETENDRE : service_id, availability_status,
-- is_active"). has_permission() n'en a pas besoin — la portee "service" est
-- une etiquette de permission, son filtrage par ligne (RLS/requetes) est un
-- chantier P3/A3, pas P2.

CREATE OR REPLACE FUNCTION public.auth_role()
 RETURNS text
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role::text from public.profiles where id = (select auth.uid());
$function$;

-- super_admin court-circuite la table (equivalent au "manage" de l'ancienne
-- MATRIX TypeScript) : pas une ligne par permission a maintenir pour lui.
-- Une portee plus large couvre une portee plus etroite sur le meme prefixe
-- (dossier.read.all couvre dossier.read.service et dossier.read.own), meme
-- logique que l'ancien can() de lib/rbac.ts.
CREATE OR REPLACE FUNCTION public.has_permission(perm text)
 RETURNS boolean
 LANGUAGE plpgsql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := (select auth.uid());
  base text;
  broader text[];
BEGIN
  IF (SELECT role::text FROM public.profiles WHERE id = uid) = 'super_admin' THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.profiles p ON p.role::text = rp.role
    WHERE p.id = uid AND rp.permission = perm
  ) OR EXISTS (
    SELECT 1 FROM public.user_permissions up
    WHERE up.user_id = uid AND up.permission = perm
  ) THEN
    RETURN true;
  END IF;

  IF perm LIKE '%.own' THEN
    base := left(perm, length(perm) - length('.own'));
    broader := ARRAY[base || '.service', base || '.all'];
  ELSIF perm LIKE '%.service' THEN
    base := left(perm, length(perm) - length('.service'));
    broader := ARRAY[base || '.all'];
  ELSE
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.profiles p ON p.role::text = rp.role
    WHERE p.id = uid AND rp.permission = ANY(broader)
  ) OR EXISTS (
    SELECT 1 FROM public.user_permissions up
    WHERE up.user_id = uid AND up.permission = ANY(broader)
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated;

-- ── 4. Seed initial de role_permissions ─────────────────────────────────────
-- Deux sources, clairement separees :
--   (a) la matrice explicite fournie par la feuille de route V3 (§P2), reprise
--       telle quelle, y compris ses exclusions explicites (comptable ✗ sur
--       paiement.validate, partenaire ✗ sur note_interne.read) ;
--   (b) un report raisonnable des capacites actuelles de admin/agent depuis
--       MATRIX (lib/rbac.ts, conservee en doublon) vers le nouveau vocabulaire,
--       la matrice (a) etant muette sur plusieurs ressources deja actives en
--       production (dossiers, clients, rdv, documents, messagerie, caisse).
-- Aucun compte agent/admin/dg/daf/... reel n'existe a ce jour (seul
-- tkankou@gmail.com, super_admin) : ce seed est un point de depart a ajuster
-- directement dans cette table (aucun code a modifier) au moment ou tu crees
-- de vrais comptes employes.
INSERT INTO public.role_permissions (role, permission) VALUES
  -- (a) matrice explicite de la feuille de route
  ('dg', 'dossier.read.all'),
  ('daf', 'dossier.read.all'),
  ('chef_service', 'dossier.read.service'),
  ('agent', 'dossier.read.own'),
  ('partenaire', 'dossier.read.partage'),
  ('admin', 'dossier.assign'),
  ('chef_service', 'dossier.assign'),
  ('admin', 'dossier.status.change'),
  ('chef_service', 'dossier.status.change'),
  ('agent', 'dossier.status.change'),
  ('partenaire', 'dossier.status.change'), -- "decision seule" : nuance a affiner en A5/A6
  ('admin', 'note_interne.read'),
  ('dg', 'note_interne.read'),
  ('daf', 'note_interne.read'),
  ('chef_service', 'note_interne.read'),
  ('agent', 'note_interne.read'),
  ('admin', 'devis.validate'),
  ('dg', 'devis.validate'),
  ('daf', 'devis.validate'),
  ('admin', 'facture.validate'),
  ('daf', 'facture.validate'),
  ('admin', 'paiement.record'),
  ('daf', 'paiement.record'),
  ('comptable', 'paiement.record'),
  ('daf', 'paiement.validate'), -- comptable exclu volontairement (separation des taches)
  ('daf', 'caisse.close'),
  ('admin', 'cms.content.write'),
  ('moderateur', 'cms.content.write'),
  ('admin', 'audit.read'),
  ('dg', 'audit.read'),

  -- (b) report des capacites admin/agent deja actives (MATRIX → nouveau vocabulaire)
  ('admin', 'dossier.create'),
  ('admin', 'dossier.update'),
  ('agent', 'dossier.update'),
  ('admin', 'client.read.all'),
  ('admin', 'client.update'),
  ('agent', 'client.read.own'),
  ('agent', 'client.update'),
  ('admin', 'rdv.read.all'),
  ('admin', 'rdv.create'),
  ('admin', 'rdv.update'),
  ('agent', 'rdv.read.own'),
  ('agent', 'rdv.create'),
  ('agent', 'rdv.update'),
  ('admin', 'document.read'),
  ('admin', 'document.upload'),
  ('admin', 'document.validate'),
  ('admin', 'document.reject'),
  ('admin', 'document.delete'),
  ('agent', 'document.read'),
  ('agent', 'document.upload'),
  ('admin', 'message.read'),
  ('admin', 'message.send'),
  ('agent', 'message.read'),
  ('agent', 'message.send'),
  ('admin', 'caisse.read'),
  ('admin', 'caisse.write'),
  ('agent', 'caisse.write'),
  ('comptable', 'caisse.read'),
  ('admin', 'rh.user.read'),
  ('admin', 'rh.user.update'),
  ('admin', 'settings.read')
ON CONFLICT (role, permission) DO NOTHING;
