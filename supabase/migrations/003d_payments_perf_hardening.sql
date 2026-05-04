-- Phase 5 step D : durcissement perf — corrige les warnings de l'audit perf
-- Supabase post-migration 003 :
--   1. multiple_permissive_policies : drop les anciennes RLS qui font doublon
--      avec les nouvelles policies payments_* créées en 003b
--   2. auth_rls_initplan : envelopper auth.uid() dans (SELECT auth.uid())
--      pour que Postgres mette en cache l'évaluation par requête (au lieu
--      de par row) — gain x10 à scale
--   3. unindexed_foreign_keys : ajouter les index manquants sur les FK

-- ─── 1. Cleanup des anciennes RLS policies sur `payments` ──────────────────

DROP POLICY IF EXISTS "Super admin full access on payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can read payments"             ON public.payments;
DROP POLICY IF EXISTS "Admin can insert payments"           ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments"           ON public.payments;
DROP POLICY IF EXISTS "Agent can read own payments only"    ON public.payments;
DROP POLICY IF EXISTS "Agent can insert own payments"       ON public.payments;
DROP POLICY IF EXISTS "Client can view own payments"        ON public.payments;
DROP POLICY IF EXISTS client_read_own_payments              ON public.payments;

-- ─── 2. Recréer les policies optimisées (auth.uid() cached) ────────────────

DROP POLICY IF EXISTS payments_select       ON public.payments;
DROP POLICY IF EXISTS payments_insert       ON public.payments;
DROP POLICY IF EXISTS payments_update       ON public.payments;
DROP POLICY IF EXISTS payments_update_notes ON public.payments;
DROP POLICY IF EXISTS payments_no_delete    ON public.payments;

CREATE POLICY payments_select ON public.payments FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
  OR created_by = (SELECT auth.uid())
  OR client_id  = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.demandes d
    WHERE d.id = payments.dossier_id
      AND d.agent_id = (SELECT auth.uid())
  )
);

CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK (
  (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin', 'agent'))
  AND created_by = (SELECT auth.uid())
);

CREATE POLICY payments_update ON public.payments FOR UPDATE USING (
  (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
);

CREATE POLICY payments_update_notes ON public.payments FOR UPDATE USING (
  created_by = (SELECT auth.uid())
  AND (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role = 'agent')
);

CREATE POLICY payments_no_delete ON public.payments FOR DELETE USING (false);

-- ─── 3. Optimiser SELECT policies des tables auxiliaires ───────────────────

DROP POLICY IF EXISTS payment_events_select ON public.payment_events;
CREATE POLICY payment_events_select ON public.payment_events FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin'))
);

DROP POLICY IF EXISTS stripe_webhook_log_select ON public.stripe_webhook_log;
CREATE POLICY stripe_webhook_log_select ON public.stripe_webhook_log FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT id FROM public.profiles WHERE role = 'super_admin')
);

-- ─── 4. Indexes manquants sur FK ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_payment_events_actor_id ON public.payment_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by     ON public.payments(created_by);
