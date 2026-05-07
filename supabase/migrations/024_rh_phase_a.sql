-- ============================================================================
-- Migration 024 — RH Phase A : Documents entreprise
-- ============================================================================
-- Vue d'ensemble + Annuaire + Statistiques utilisent uniquement les tables
-- existantes (employees, payslips, leave_requests si presents).
-- Cette migration ajoute uniquement la table company_documents + bucket.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type TEXT NOT NULL
    CHECK (type IN ('reglement_interieur', 'charte', 'convention_collective',
                    'guide', 'proces_verbal', 'autre')),
  name TEXT NOT NULL,
  description TEXT,

  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  version TEXT,

  visible_to TEXT NOT NULL DEFAULT 'staff'
    CHECK (visible_to IN ('tous', 'staff', 'super_admin')),

  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_documents_type
  ON public.company_documents(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_documents_visible
  ON public.company_documents(visible_to);

-- Trigger updated_at (function set_updated_at deja creee dans 022)
DROP TRIGGER IF EXISTS trg_company_documents_updated_at ON public.company_documents;
CREATE TRIGGER trg_company_documents_updated_at
  BEFORE UPDATE ON public.company_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Bucket Storage prive
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  20971520,  -- 20 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_docs_super_admin_full" ON public.company_documents;
CREATE POLICY "company_docs_super_admin_full" ON public.company_documents
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

DROP POLICY IF EXISTS "company_docs_admin_select" ON public.company_documents;
CREATE POLICY "company_docs_admin_select" ON public.company_documents
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
    OR (
      visible_to IN ('tous', 'staff')
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin', 'super_admin'))
    )
  );

-- Storage policies pour company-documents
DROP POLICY IF EXISTS "company_docs_storage_super_admin_all" ON storage.objects;
CREATE POLICY "company_docs_storage_super_admin_all" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'company-documents'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  )
  WITH CHECK (
    bucket_id = 'company-documents'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

DROP POLICY IF EXISTS "company_docs_storage_select" ON storage.objects;
CREATE POLICY "company_docs_storage_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'company-documents'
    AND auth.uid() IS NOT NULL
  );
