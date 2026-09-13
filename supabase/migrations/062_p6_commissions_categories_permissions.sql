-- ============================================================================
-- 062 — P6, lot Categories comptables + Commissions : permissions manquantes
--
-- 'commission.read'/'commission.validate' sont dans l'enumeration §P2 mais
-- n'avaient jamais ete seedees (0 ligne avant cette migration). 'commission.
-- create' n'existe pas dans l'enumeration officielle : ajoutee ici par
-- necessite (creation manuelle confirmee par Thierry le 06/09/2026 - pas de
-- formule automatique, le schema ne porte aucun taux configurable), meme
-- traitement que devis.create/facture.create avant elle (060, 061).
--
-- 'categorie_compta.write' n'existe pas non plus dans l'enumeration : les
-- categories comptables sont une donnee de reference proche d'un parametrage
-- (agency_settings), reservee a l'admin.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'commission.create'),
  ('daf', 'commission.create'),
  ('admin', 'commission.read'),
  ('dg', 'commission.read'),
  ('daf', 'commission.read'),
  ('comptable', 'commission.read'),
  ('admin', 'commission.validate'),
  ('dg', 'commission.validate'),
  ('daf', 'commission.validate'),
  ('admin', 'categorie_compta.write')
ON CONFLICT (role, permission) DO NOTHING;
