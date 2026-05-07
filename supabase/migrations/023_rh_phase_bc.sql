-- ============================================================================
-- Migration 023 — RH Phase B + C
-- ============================================================================
-- Phase B : sous-categorisation documents + notes historisees
-- Phase C : cotisations et lignes detaillees deja supportees via JSONB en 022
-- ============================================================================

-- ----------------------------------------------------------------------------
-- B.2 — sous-categorie documents RH
-- ----------------------------------------------------------------------------
ALTER TABLE public.hr_documents
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

CREATE INDEX IF NOT EXISTS idx_hr_documents_subcategory
  ON public.hr_documents(subcategory);

-- ----------------------------------------------------------------------------
-- B.3 — table employee_notes (timeline append-only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_notes_employee_id
  ON public.employee_notes(employee_id, created_at DESC);

ALTER TABLE public.employee_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_notes_admin_select" ON public.employee_notes;
CREATE POLICY "employee_notes_admin_select" ON public.employee_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "employee_notes_admin_insert" ON public.employee_notes;
CREATE POLICY "employee_notes_admin_insert" ON public.employee_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- Pas de UPDATE/DELETE policies → notes append-only par design.

-- ============================================================================
-- FIN MIGRATION 023
-- ============================================================================
