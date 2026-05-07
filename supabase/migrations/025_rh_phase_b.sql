-- ============================================================================
-- Migration 025 — RH Phase B : Conges & absences + Calendrier
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE leave_types (referentiel types de conge)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  max_days_year NUMERIC(5, 1) NOT NULL DEFAULT 0,
  color_hex TEXT NOT NULL DEFAULT '#FF6600',
  paid BOOLEAN NOT NULL DEFAULT TRUE,
  requires_doc BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pre-remplissage avec types courants RCA
INSERT INTO public.leave_types (code, label, max_days_year, color_hex, paid, requires_doc)
VALUES
  ('CONGES_PAYES', 'Congés payés', 30, '#10B981', true, false),
  ('MALADIE', 'Arrêt maladie', 0, '#F59E0B', true, true),
  ('MARIAGE', 'Mariage', 4, '#EC4899', true, false),
  ('DECES_FAMILLE', 'Décès famille', 3, '#64748B', true, false),
  ('MATERNITE', 'Maternité', 98, '#EC4899', true, true),
  ('PATERNITE', 'Paternité', 11, '#3B82F6', true, false),
  ('SANS_SOLDE', 'Sans solde', 0, '#94A3B8', false, false),
  ('FORMATION', 'Formation', 0, '#8B5CF6', true, false),
  ('AUTRE', 'Autre', 0, '#6B7280', false, false)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. TABLE leave_requests (demandes de conge)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE RESTRICT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(5, 1) NOT NULL CHECK (total_days >= 0),
  half_day_start BOOLEAN NOT NULL DEFAULT FALSE,
  half_day_end BOOLEAN NOT NULL DEFAULT FALSE,

  reason TEXT,
  doc_url TEXT,

  statut TEXT NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente', 'valide', 'refuse', 'annule')),
  requested_by UUID REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_statut ON public.leave_requests(statut, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

DROP TRIGGER IF EXISTS trg_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER trg_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. TABLE leave_balances (soldes par employe / annee / type)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year INT NOT NULL,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  acquired_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, year, leave_type_id)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON public.leave_balances(employee_id, year);

DROP TRIGGER IF EXISTS trg_leave_balances_updated_at ON public.leave_balances;
CREATE TRIGGER trg_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. TABLE holidays_car (jours feries Republique Centrafricaine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.holidays_car (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  date DATE NOT NULL UNIQUE,
  label TEXT NOT NULL,
  fixed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holidays_car_date ON public.holidays_car(date);

-- Pre-remplissage 2026 (jours feries officiels RCA)
INSERT INTO public.holidays_car (year, date, label, fixed) VALUES
  (2026, '2026-01-01', 'Nouvel An', true),
  (2026, '2026-03-29', 'Anniversaire de la mort de Boganda', true),
  (2026, '2026-04-06', 'Lundi de Pâques', false),
  (2026, '2026-05-01', 'Fête du Travail', true),
  (2026, '2026-05-14', 'Ascension', false),
  (2026, '2026-05-25', 'Lundi de Pentecôte', false),
  (2026, '2026-06-30', 'Fête des Mères', true),
  (2026, '2026-08-13', 'Indépendance', true),
  (2026, '2026-08-15', 'Assomption', true),
  (2026, '2026-11-01', 'Toussaint', true),
  (2026, '2026-12-01', 'Proclamation de la République', true),
  (2026, '2026-12-25', 'Noël', true)
ON CONFLICT (date) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. RLS leave_types (referentiel — lecture pour tout staff connecte)
-- ----------------------------------------------------------------------------
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_types_staff_select" ON public.leave_types;
CREATE POLICY "leave_types_staff_select" ON public.leave_types
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "leave_types_super_admin_full" ON public.leave_types;
CREATE POLICY "leave_types_super_admin_full" ON public.leave_types
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- ----------------------------------------------------------------------------
-- 6. RLS leave_requests
-- ----------------------------------------------------------------------------
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_requests_admin_full" ON public.leave_requests;
CREATE POLICY "leave_requests_admin_full" ON public.leave_requests
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

-- Employe lit ses propres demandes et peut creer/annuler les siennes
DROP POLICY IF EXISTS "leave_requests_self_select" ON public.leave_requests;
CREATE POLICY "leave_requests_self_select" ON public.leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = leave_requests.employee_id AND e.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "leave_requests_self_insert" ON public.leave_requests;
CREATE POLICY "leave_requests_self_insert" ON public.leave_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = leave_requests.employee_id AND e.profile_id = auth.uid()
    )
    AND statut = 'en_attente'
  );

DROP POLICY IF EXISTS "leave_requests_self_cancel" ON public.leave_requests;
CREATE POLICY "leave_requests_self_cancel" ON public.leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = leave_requests.employee_id AND e.profile_id = auth.uid()
    )
    AND statut = 'en_attente'
  )
  WITH CHECK (statut IN ('en_attente', 'annule'));

-- ----------------------------------------------------------------------------
-- 7. RLS leave_balances
-- ----------------------------------------------------------------------------
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_balances_admin_full" ON public.leave_balances;
CREATE POLICY "leave_balances_admin_full" ON public.leave_balances
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "leave_balances_self_select" ON public.leave_balances;
CREATE POLICY "leave_balances_self_select" ON public.leave_balances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = leave_balances.employee_id AND e.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 8. RLS holidays_car (lecture publique pour tout staff)
-- ----------------------------------------------------------------------------
ALTER TABLE public.holidays_car ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "holidays_car_staff_select" ON public.holidays_car;
CREATE POLICY "holidays_car_staff_select" ON public.holidays_car
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "holidays_car_super_admin_full" ON public.holidays_car;
CREATE POLICY "holidays_car_super_admin_full" ON public.holidays_car
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
