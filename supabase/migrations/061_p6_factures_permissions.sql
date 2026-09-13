-- ============================================================================
-- 061 — P6, lot Factures : permissions manquantes 'facture.create'/'facture.cancel'
--
-- Meme situation que la migration 060 (devis) : role_permissions (043b)
-- seedait deja 'facture.validate' (admin/daf) mais pas 'facture.create'/
-- 'facture.cancel', absentes de l'extrait de matrice §P2 alors que la
-- ressource etait listee dans l'enumeration des permissions.
--
-- Separation des taches : 'facture.create' couvre la saisie du brouillon
-- (agent sur ses dossiers, chef_service/comptable/admin/dg/daf plus
-- largement) ; 'facture.validate' (deja seedee) reste le seul chemin vers
-- 'validee' ; 'facture.cancel' (admin/daf, memes roles que validate) gere
-- l'annulation.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission) VALUES
  ('agent', 'facture.create'),
  ('chef_service', 'facture.create'),
  ('comptable', 'facture.create'),
  ('admin', 'facture.create'),
  ('dg', 'facture.create'),
  ('daf', 'facture.create'),
  ('admin', 'facture.cancel'),
  ('daf', 'facture.cancel')
ON CONFLICT (role, permission) DO NOTHING;
