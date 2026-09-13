-- ============================================================================
-- 046 — P3 : contenus_site, faq, partenaires, temoignages, pays_destinations,
-- bureaux, notification_prefs, agency_settings
--
-- Tables CMS (P8) et parametres — schema fondation uniquement, l'ecran
-- d'administration arrive en P8. Lecture publique pour les tables qui
-- alimentent le site public (contenus_site, faq, partenaires, temoignages,
-- pays_destinations, bureaux), ecriture reservee au staff.
-- ============================================================================

CREATE TABLE public.contenus_site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cle text NOT NULL UNIQUE,
  section text NOT NULL,
  contenu jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contenus_site ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read contenus_site" ON public.contenus_site
  FOR SELECT USING (true);
CREATE POLICY "Staff can manage contenus_site" ON public.contenus_site
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  reponse text NOT NULL,
  categorie text,
  ordre_affichage int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active faq" ON public.faq
  FOR SELECT USING (status = 'actif');
CREATE POLICY "Staff can manage faq" ON public.faq
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

-- Aucun faux partenaire, aucun logo non autorise (regle P8) : le controle
-- est humain (staff), pas technique — cette table ne fait qu'heberger la
-- donnee validee.
CREATE TABLE public.partenaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  logo_url text,
  site_url text,
  description text,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  ordre_affichage int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active partenaires" ON public.partenaires
  FOR SELECT USING (status = 'actif');
CREATE POLICY "Staff can manage partenaires" ON public.partenaires
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

-- Un temoignage n'est publiable que marque verifie, avec sa source (regle P8).
CREATE TABLE public.temoignages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auteur_nom text NOT NULL,
  auteur_role text,
  contenu text NOT NULL,
  note int CHECK (note BETWEEN 1 AND 5),
  verifie boolean NOT NULL DEFAULT false,
  source text,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.temoignages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active verified temoignages" ON public.temoignages
  FOR SELECT USING (status = 'actif' AND verifie = true);
CREATE POLICY "Staff can manage temoignages" ON public.temoignages
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.pays_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  code_iso text,
  continent text,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  ordre_affichage int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pays_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active pays_destinations" ON public.pays_destinations
  FOR SELECT USING (status = 'actif');
CREATE POLICY "Staff can manage pays_destinations" ON public.pays_destinations
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.bureaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  adresse text NOT NULL,
  ville text NOT NULL,
  pays text NOT NULL,
  telephone text,
  email text,
  horaires text,
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bureaux ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active bureaux" ON public.bureaux
  FOR SELECT USING (status = 'actif');
CREATE POLICY "Staff can manage bureaux" ON public.bureaux
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  push_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification_prefs" ON public.notification_prefs
  FOR ALL USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Staff can read notification_prefs" ON public.notification_prefs
  FOR SELECT USING (is_staff((select auth.uid())));

CREATE TABLE public.agency_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cle text NOT NULL UNIQUE,
  valeur jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read agency_settings" ON public.agency_settings
  FOR SELECT USING (is_staff((select auth.uid())));
CREATE POLICY "Super admin manages agency_settings" ON public.agency_settings
  FOR ALL
  USING (get_user_role((select auth.uid())) = 'super_admin')
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');
