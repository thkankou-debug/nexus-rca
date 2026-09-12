-- ============================================================================
-- 081 — Espaces DAF et Comptable (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md,
-- Partie 5 étape 5 ; chaîne §4.3) : maillon « comptable rapproche » entre
-- la saisie (paiement.record) et la validation DAF (paiement.validate).
--
--   saisi (pending/paid, reconciled_at NULL)   « déclaré »
--   → comptable rapproche (reconciled_at posé)  « à valider »
--   → DAF valide (status = 'validated')         « encaissé »
--
-- Additif uniquement : aucun enum touché, aucun trigger modifié, aucun des
-- 3 paiements réels legacy (metadata.legacy = true, grandfathered en P6-0)
-- modifié. La contrainte « le validateur diffère du créateur » reste portée
-- par le trigger payments_check_transition existant ; la contrainte « le
-- rapprocheur diffère du créateur » est appliquée par la route API (même
-- séparation des tâches, pas de nouveau trigger sur cette table sensible).
--
-- Permissions :
-- - paiement.reconcile : comptable, admin, daf (nouvelle chaîne, absente du
--   catalogue §P2 — même traitement que commission.create/devis.create
--   avant elle : ajoutée par nécessité, signalée dans docs/DETTE.md)
-- - depense.validate : admin, daf (la validation de dépense existait en UI
--   admin/super_admin via RLS seulement, sans permission déclarative — le
--   DAF en a besoin pour l'écran Trésorerie sans passer super_admin)
-- ============================================================================

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS reconciled_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reconciled_at timestamptz;

COMMENT ON COLUMN public.payments.reconciled_at IS
  'Rapprochement comptable (chaîne §4.3) : posé par paiement.reconcile, prérequis de la validation DAF. NULL = déclaré, non NULL + status<>validated = à valider.';

CREATE INDEX IF NOT EXISTS idx_payments_reconciled_at
  ON public.payments(reconciled_at)
  WHERE reconciled_at IS NOT NULL;

INSERT INTO public.role_permissions (role, permission) VALUES
  ('comptable', 'paiement.reconcile'),
  ('admin', 'paiement.reconcile'),
  ('daf', 'paiement.reconcile'),
  ('admin', 'depense.validate'),
  ('daf', 'depense.validate')
ON CONFLICT DO NOTHING;
