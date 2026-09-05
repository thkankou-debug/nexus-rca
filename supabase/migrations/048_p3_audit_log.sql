-- ============================================================================
-- 048 — P3 : audit_log, calque sur payment_events
--
-- Meme patron que payment_events (verifie avant d'ecrire) : lecture
-- restreinte, AUCUNE policy UPDATE/DELETE pour aucun role y compris
-- super_admin, ecriture par service_role uniquement (triggers + appel
-- explicite depuis les actions serveur, lib/audit.ts — a cabler phase par
-- phase, pas ici). Lecture etendue a dg par rapport a payment_events
-- (super_admin/admin) : coherent avec le seed P2 qui accorde deja
-- audit.read a dg.
-- ============================================================================

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_role text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON public.audit_log
  FOR SELECT USING (
    (select auth.uid()) IN (
      SELECT profiles.id FROM public.profiles
      WHERE profiles.role = ANY (ARRAY['super_admin'::user_role, 'admin'::user_role, 'dg'::user_role])
    )
  );
