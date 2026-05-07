-- ============================================================================
-- Migration 028 — RH Phase E : Notifications auto + Settings + Cron
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE rh_settings (parametres RH key/value)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rh_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'cotisations', 'paie', 'conges', 'contrat', 'notifications')),
  value_text TEXT,
  value_number NUMERIC,
  value_json JSONB,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rh_settings_category ON public.rh_settings(category);

DROP TRIGGER IF EXISTS trg_rh_settings_updated_at ON public.rh_settings;
CREATE TRIGGER trg_rh_settings_updated_at
  BEFORE UPDATE ON public.rh_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pre-remplissage avec defaults RCA
INSERT INTO public.rh_settings (key, label, category, value_number, value_text, description) VALUES
  ('cnss_employee_rate', 'Taux CNSS salarié', 'cotisations', 3, NULL, 'Pourcentage CNSS prélevé sur salaire brut (côté salarié)'),
  ('cnss_employer_rate', 'Taux CNSS employeur', 'cotisations', 13, NULL, 'Pourcentage CNSS à charge de l''employeur'),
  ('irpp_default', 'IRPP par défaut (FCFA)', 'cotisations', 0, NULL, 'Montant IRPP par défaut sur fiche de paie (peut être ajusté manuellement)'),
  ('its_default', 'ITS par défaut (FCFA)', 'cotisations', 0, NULL, 'Impôt sur Traitement et Salaire par défaut'),
  ('default_lieu_travail', 'Lieu de travail par défaut', 'contrat', NULL, 'Bangui, République Centrafricaine', 'Lieu mentionné sur les contrats par défaut'),
  ('default_periode_essai_cdi', 'Période d''essai CDI (mois)', 'contrat', 3, NULL, 'Durée standard de la période d''essai pour un CDI'),
  ('default_periode_essai_cdd', 'Période d''essai CDD (mois)', 'contrat', 1, NULL, 'Durée standard de la période d''essai pour un CDD'),
  ('default_periode_essai_stage', 'Période d''essai Stage (jours)', 'contrat', 15, NULL, 'Durée standard de la période d''essai pour un Stage'),
  ('default_horaire_hebdomadaire', 'Heures hebdomadaires par défaut', 'paie', 40, NULL, 'Durée du travail hebdomadaire standard'),
  ('email_paie_from', 'Email expéditeur fiches de paie', 'notifications', NULL, 'paie@nexusrca.com', 'Adresse email From pour les fiches de paie validées'),
  ('rh_notifications_enabled', 'Notifications RH activées', 'notifications', 1, NULL, '1 = activé, 0 = désactivé (cron quotidien)'),
  ('birthday_notification_enabled', 'Notif anniversaires activée', 'notifications', 1, NULL, '1 = notifier les anniversaires du jour'),
  ('contract_end_alert_days', 'Alerte fin contrat (jours avant)', 'notifications', 30, NULL, 'Délai avant fin de période d''essai/CDD pour alerter')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. RLS rh_settings
-- ----------------------------------------------------------------------------
ALTER TABLE public.rh_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rh_settings_super_admin_full" ON public.rh_settings;
CREATE POLICY "rh_settings_super_admin_full" ON public.rh_settings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

DROP POLICY IF EXISTS "rh_settings_admin_select" ON public.rh_settings;
CREATE POLICY "rh_settings_admin_select" ON public.rh_settings
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

-- ----------------------------------------------------------------------------
-- 3. Ajout colonne category sur notifications (si pas deja la)
--    pour distinguer RH/payments/etc.
-- ----------------------------------------------------------------------------
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_notifications_category
  ON public.notifications(category, user_id, created_at DESC);
