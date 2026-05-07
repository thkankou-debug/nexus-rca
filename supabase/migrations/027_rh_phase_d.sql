-- ============================================================================
-- Migration 027 — RH Phase D : Evaluations performance (entretien annuel)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE review_periods (campagnes d evaluation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'planifie'
    CHECK (statut IN ('planifie', 'en_cours', 'termine', 'archive')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_review_periods_year ON public.review_periods(year DESC);
CREATE INDEX IF NOT EXISTS idx_review_periods_statut ON public.review_periods(statut);

DROP TRIGGER IF EXISTS trg_review_periods_updated_at ON public.review_periods;
CREATE TRIGGER trg_review_periods_updated_at
  BEFORE UPDATE ON public.review_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. TABLE performance_reviews (instance par employe x periode)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.review_periods(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id),

  statut TEXT NOT NULL DEFAULT 'programme'
    CHECK (statut IN ('programme', 'auto_eval', 'manager_review', 'meeting', 'signe', 'annule')),

  -- Auto-evaluation employe (JSONB structure libre)
  -- { realizations, challenges, skills_developed, self_rating (1-5),
  --   objectives_review (array) }
  self_assessment JSONB DEFAULT '{}'::jsonb,
  self_assessment_submitted_at TIMESTAMPTZ,

  -- Evaluation manager (JSONB structure libre)
  -- { strengths, areas_to_improve, overall_rating (1-5),
  --   salary_recommendation, comments }
  manager_assessment JSONB DEFAULT '{}'::jsonb,
  manager_assessment_submitted_at TIMESTAMPTZ,

  -- Objectifs annee suivante
  objectives JSONB DEFAULT '[]'::jsonb,
  -- Plan de formation
  formation_plan TEXT,

  -- Entretien physique
  meeting_date TIMESTAMPTZ,
  meeting_notes TEXT,

  -- Signatures
  signed_employee_at TIMESTAMPTZ,
  signed_manager_at TIMESTAMPTZ,

  notes_finales TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employee_id, period_id)
);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_period ON public.performance_reviews(period_id, statut);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_statut ON public.performance_reviews(statut);

DROP TRIGGER IF EXISTS trg_performance_reviews_updated_at ON public.performance_reviews;
CREATE TRIGGER trg_performance_reviews_updated_at
  BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. RLS review_periods (super_admin/admin full, agent read pour voir
--    s ils sont concernes)
-- ----------------------------------------------------------------------------
ALTER TABLE public.review_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_periods_admin_full" ON public.review_periods;
CREATE POLICY "review_periods_admin_full" ON public.review_periods
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "review_periods_staff_select" ON public.review_periods;
CREATE POLICY "review_periods_staff_select" ON public.review_periods
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin', 'super_admin')));

-- ----------------------------------------------------------------------------
-- 4. RLS performance_reviews
-- ----------------------------------------------------------------------------
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_reviews_admin_full" ON public.performance_reviews;
CREATE POLICY "performance_reviews_admin_full" ON public.performance_reviews
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

-- Employe lit sa propre review et peut MAJ son auto-eval
DROP POLICY IF EXISTS "performance_reviews_self_select" ON public.performance_reviews;
CREATE POLICY "performance_reviews_self_select" ON public.performance_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = performance_reviews.employee_id AND e.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "performance_reviews_self_self_eval" ON public.performance_reviews;
CREATE POLICY "performance_reviews_self_self_eval" ON public.performance_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = performance_reviews.employee_id AND e.profile_id = auth.uid()
    )
    AND statut IN ('programme', 'auto_eval')
  )
  WITH CHECK (
    statut IN ('auto_eval', 'manager_review')
  );
