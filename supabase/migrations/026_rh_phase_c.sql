-- ============================================================================
-- Migration 026 — RH Phase C : Onboarding + Templates
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE onboarding_templates (templates de checklist)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type_contrat TEXT,
  default_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_onboarding_templates_updated_at ON public.onboarding_templates;
CREATE TRIGGER trg_onboarding_templates_updated_at
  BEFORE UPDATE ON public.onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. TABLE employee_onboarding (instance par employe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.onboarding_templates(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  completion_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_onboarding_employee ON public.employee_onboarding(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_completion ON public.employee_onboarding(completion_pct);

DROP TRIGGER IF EXISTS trg_employee_onboarding_updated_at ON public.employee_onboarding;
CREATE TRIGGER trg_employee_onboarding_updated_at
  BEFORE UPDATE ON public.employee_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. TABLE onboarding_tasks (tasks individuelles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_onboarding_id UUID NOT NULL REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,

  task_order INT NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre'
    CHECK (category IN ('contrat', 'equipement', 'formation', 'admin', 'rh', 'integration', 'autre')),
  description TEXT,
  due_date DATE,
  mandatory BOOLEAN NOT NULL DEFAULT FALSE,

  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_onboarding ON public.onboarding_tasks(employee_onboarding_id, task_order);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_due_date ON public.onboarding_tasks(due_date);

DROP TRIGGER IF EXISTS trg_onboarding_tasks_updated_at ON public.onboarding_tasks;
CREATE TRIGGER trg_onboarding_tasks_updated_at
  BEFORE UPDATE ON public.onboarding_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. PRE-REMPLISSAGE templates standards
-- ----------------------------------------------------------------------------
INSERT INTO public.onboarding_templates (name, description, type_contrat, default_tasks)
VALUES
  ('CDI Standard', 'Onboarding standard pour nouveau salarie en CDI', 'CDI',
    '[
      {"order":1,"label":"Signature du contrat","category":"contrat","days_offset":0,"mandatory":true},
      {"order":2,"label":"Verification piece d identite + CNI","category":"admin","days_offset":0,"mandatory":true},
      {"order":3,"label":"Inscription CNSS","category":"rh","days_offset":7,"mandatory":true},
      {"order":4,"label":"Creation compte email professionnel","category":"equipement","days_offset":1,"mandatory":true},
      {"order":5,"label":"Remise materiel (ordinateur, badge)","category":"equipement","days_offset":1,"mandatory":true},
      {"order":6,"label":"Visite des locaux","category":"integration","days_offset":1,"mandatory":false},
      {"order":7,"label":"Presentation a l equipe","category":"integration","days_offset":2,"mandatory":false},
      {"order":8,"label":"Lecture reglement interieur","category":"admin","days_offset":3,"mandatory":true},
      {"order":9,"label":"Formation aux outils internes","category":"formation","days_offset":7,"mandatory":true},
      {"order":10,"label":"Premier point hebdomadaire avec manager","category":"integration","days_offset":7,"mandatory":false},
      {"order":11,"label":"Bilan de fin de periode d essai","category":"rh","days_offset":90,"mandatory":true}
    ]'::jsonb
  ),
  ('CDD Court', 'Onboarding allege pour CDD', 'CDD',
    '[
      {"order":1,"label":"Signature du contrat","category":"contrat","days_offset":0,"mandatory":true},
      {"order":2,"label":"Verification piece d identite","category":"admin","days_offset":0,"mandatory":true},
      {"order":3,"label":"Creation compte email professionnel","category":"equipement","days_offset":1,"mandatory":true},
      {"order":4,"label":"Remise materiel necessaire","category":"equipement","days_offset":1,"mandatory":true},
      {"order":5,"label":"Presentation a l equipe","category":"integration","days_offset":1,"mandatory":false},
      {"order":6,"label":"Brief mission et objectifs","category":"integration","days_offset":1,"mandatory":true},
      {"order":7,"label":"Lecture reglement interieur","category":"admin","days_offset":2,"mandatory":true}
    ]'::jsonb
  ),
  ('Stage', 'Onboarding pour stagiaire', 'Stage',
    '[
      {"order":1,"label":"Signature convention de stage","category":"contrat","days_offset":0,"mandatory":true},
      {"order":2,"label":"Verification piece d identite","category":"admin","days_offset":0,"mandatory":true},
      {"order":3,"label":"Designation tuteur","category":"rh","days_offset":0,"mandatory":true},
      {"order":4,"label":"Acces aux outils (email, partages)","category":"equipement","days_offset":1,"mandatory":true},
      {"order":5,"label":"Brief sur la mission de stage","category":"integration","days_offset":1,"mandatory":true},
      {"order":6,"label":"Plan d apprentissage avec tuteur","category":"formation","days_offset":3,"mandatory":true},
      {"order":7,"label":"Point intermediaire (mi-stage)","category":"rh","days_offset":45,"mandatory":false},
      {"order":8,"label":"Restitution finale","category":"rh","days_offset":90,"mandatory":true}
    ]'::jsonb
  ),
  ('Freelance', 'Onboarding minimal pour prestataire freelance', 'Freelance',
    '[
      {"order":1,"label":"Signature contrat de prestation","category":"contrat","days_offset":0,"mandatory":true},
      {"order":2,"label":"Recuperation RIB pour facturation","category":"admin","days_offset":0,"mandatory":true},
      {"order":3,"label":"Acces outils projet","category":"equipement","days_offset":1,"mandatory":true},
      {"order":4,"label":"Brief mission et livrables","category":"integration","days_offset":1,"mandatory":true},
      {"order":5,"label":"Point milestone projet","category":"integration","days_offset":15,"mandatory":false}
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. RLS onboarding_templates (super_admin full, admin read)
-- ----------------------------------------------------------------------------
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_templates_super_admin_full" ON public.onboarding_templates;
CREATE POLICY "onboarding_templates_super_admin_full" ON public.onboarding_templates
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

DROP POLICY IF EXISTS "onboarding_templates_admin_select" ON public.onboarding_templates;
CREATE POLICY "onboarding_templates_admin_select" ON public.onboarding_templates
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

-- ----------------------------------------------------------------------------
-- 6. RLS employee_onboarding
-- ----------------------------------------------------------------------------
ALTER TABLE public.employee_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_onboarding_admin_full" ON public.employee_onboarding;
CREATE POLICY "employee_onboarding_admin_full" ON public.employee_onboarding
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "employee_onboarding_self_select" ON public.employee_onboarding;
CREATE POLICY "employee_onboarding_self_select" ON public.employee_onboarding
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_onboarding.employee_id AND e.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. RLS onboarding_tasks
-- ----------------------------------------------------------------------------
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_tasks_admin_full" ON public.onboarding_tasks;
CREATE POLICY "onboarding_tasks_admin_full" ON public.onboarding_tasks
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "onboarding_tasks_self_select" ON public.onboarding_tasks;
CREATE POLICY "onboarding_tasks_self_select" ON public.onboarding_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employee_onboarding eo
      JOIN public.employees e ON e.id = eo.employee_id
      WHERE eo.id = onboarding_tasks.employee_onboarding_id AND e.profile_id = auth.uid()
    )
  );
