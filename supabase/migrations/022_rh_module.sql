-- ============================================================================
-- Migration 022 — Module RH / Paie
-- ============================================================================
-- Architecture compatible Phase B (documents enrichis) et Phase C (cotisations).
-- Workflow validation : brouillon → en_attente_validation → validee
-- Refus : revient en brouillon, historique conservé.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE employees
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lien optionnel vers un compte profile (agent app)
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL UNIQUE,

  -- Identité
  nom_complet TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  adresse TEXT,
  date_naissance DATE,
  numero_cni TEXT,

  -- Poste
  poste TEXT NOT NULL,
  departement TEXT NOT NULL,
  date_embauche DATE NOT NULL,
  type_contrat TEXT,
  statut TEXT NOT NULL DEFAULT 'actif'
    CHECK (statut IN ('actif', 'inactif', 'suspendu', 'parti')),

  -- Rémunération
  salaire_base NUMERIC(12, 2) NOT NULL CHECK (salaire_base >= 0),
  frequence_paie TEXT NOT NULL DEFAULT 'mensuel'
    CHECK (frequence_paie IN ('mensuel', 'bi-mensuel', 'hebdomadaire')),

  -- Notes super-admin uniquement
  notes_internes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_profile_id ON public.employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_employees_statut ON public.employees(statut);
CREATE INDEX IF NOT EXISTS idx_employees_departement ON public.employees(departement);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. TABLE payslips (fiches de paie)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,

  -- Référence humaine
  reference TEXT UNIQUE NOT NULL,

  -- Période
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  mois_libelle TEXT NOT NULL,

  -- Montants (FCFA, arrondis entiers possibles)
  salaire_brut NUMERIC(12, 2) NOT NULL CHECK (salaire_brut >= 0),
  salaire_net NUMERIC(12, 2) NOT NULL CHECK (salaire_net >= 0),

  -- Architecture compat Phase C (vide au début)
  details_lignes JSONB NOT NULL DEFAULT '[]'::jsonb,
  cotisations JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Workflow validation
  statut TEXT NOT NULL DEFAULT 'brouillon'
    CHECK (statut IN ('brouillon', 'en_attente_validation', 'validee')),
  created_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ,
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMPTZ,
  pdf_url TEXT,

  notes_admin TEXT,
  notes_super_admin TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_statut ON public.payslips(statut);
CREATE INDEX IF NOT EXISTS idx_payslips_periode ON public.payslips(periode_debut DESC);

DROP TRIGGER IF EXISTS trg_payslips_updated_at ON public.payslips;
CREATE TRIGGER trg_payslips_updated_at
  BEFORE UPDATE ON public.payslips
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. TABLE payslip_validation_history (audit trail workflow)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payslip_validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID NOT NULL REFERENCES public.payslips(id) ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN ('created', 'submitted', 'validated', 'rejected', 'edited')),
  performed_by UUID REFERENCES public.profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payslip_history_payslip_id
  ON public.payslip_validation_history(payslip_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. TABLE hr_documents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hr_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,

  type TEXT NOT NULL
    CHECK (type IN ('contrat', 'diplome', 'piece_identite', 'autre')),
  nom TEXT NOT NULL,
  description TEXT,

  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,

  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hr_documents_employee_id
  ON public.hr_documents(employee_id, type);

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKETS (privés, accès via signed URL)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('hr-documents', 'hr-documents', false, 10485760,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('employee-payslips', 'employee-payslips', false, 5242880,
    ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ENABLE RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES — employees
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "employees_admin_full" ON public.employees;
CREATE POLICY "employees_admin_full" ON public.employees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "employees_self_read" ON public.employees;
CREATE POLICY "employees_self_read" ON public.employees
  FOR SELECT
  USING (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. RLS POLICIES — payslips
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "payslips_super_admin_full" ON public.payslips;
CREATE POLICY "payslips_super_admin_full" ON public.payslips
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "payslips_admin_select" ON public.payslips;
CREATE POLICY "payslips_admin_select" ON public.payslips
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "payslips_admin_insert" ON public.payslips;
CREATE POLICY "payslips_admin_insert" ON public.payslips
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "payslips_admin_update_draft" ON public.payslips;
CREATE POLICY "payslips_admin_update_draft" ON public.payslips
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    AND statut = 'brouillon'
  )
  WITH CHECK (
    statut IN ('brouillon', 'en_attente_validation')
  );

-- Employé voit ses propres fiches validées uniquement
DROP POLICY IF EXISTS "payslips_self_read_validated" ON public.payslips;
CREATE POLICY "payslips_self_read_validated" ON public.payslips
  FOR SELECT
  USING (
    statut = 'validee'
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = payslips.employee_id
        AND e.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 9. RLS POLICIES — payslip_validation_history
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "payslip_history_admin_full" ON public.payslip_validation_history;
CREATE POLICY "payslip_history_admin_full" ON public.payslip_validation_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------------------
-- 10. RLS POLICIES — hr_documents
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "hr_documents_admin_full" ON public.hr_documents;
CREATE POLICY "hr_documents_admin_full" ON public.hr_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "hr_documents_self_read" ON public.hr_documents;
CREATE POLICY "hr_documents_self_read" ON public.hr_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = hr_documents.employee_id
        AND e.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 11. STORAGE POLICIES — hr-documents bucket
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "hr_documents_storage_admin_all" ON storage.objects;
CREATE POLICY "hr_documents_storage_admin_all" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'hr-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    bucket_id = 'hr-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Lecture employé via signed URL — on autorise SELECT pour permettre la
-- génération de signed URL côté serveur. Sécurité via signed URL TTL.
DROP POLICY IF EXISTS "hr_documents_storage_self_select" ON storage.objects;
CREATE POLICY "hr_documents_storage_self_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'hr-documents'
    AND auth.uid() IS NOT NULL
  );

-- ----------------------------------------------------------------------------
-- 12. STORAGE POLICIES — employee-payslips bucket
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "payslips_storage_super_admin_all" ON storage.objects;
CREATE POLICY "payslips_storage_super_admin_all" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'employee-payslips'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    bucket_id = 'employee-payslips'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "payslips_storage_admin_select" ON storage.objects;
CREATE POLICY "payslips_storage_admin_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'employee-payslips'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "payslips_storage_self_select" ON storage.objects;
CREATE POLICY "payslips_storage_self_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'employee-payslips'
    AND auth.uid() IS NOT NULL
  );

-- ============================================================================
-- FIN MIGRATION 022
-- ============================================================================
