-- ============================================================================
-- 060 — P6, lot Devis : permissions manquantes 'devis.create'/'devis.send'
--
-- La table role_permissions (043b) seedait deja 'devis.validate' (admin/dg/
-- daf) mais pas 'devis.create'/'devis.send', absentes de l'extrait de
-- matrice §P2 alors que la ressource etait bien listee dans l'enumeration
-- des permissions. Meme situation que la dette #4 deja loggee en P2 :
-- complete ici, sans toucher au code, au moment ou la table `devis` recoit
-- sa premiere UI.
--
-- Perimetre : les roles qui gerent effectivement un dossier (agent sur les
-- siens, chef_service/admin/dg/daf plus largement) peuvent creer et envoyer
-- un devis. 'devis.validate' reste seede mais non branche a une transition
-- de statut dans ce lot : `devis.status` n'a pas d'etat "valide" distinct
-- (brouillon/envoye/accepte/refuse/expire, migration 045) — voir
-- docs/DETTE.md.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission) VALUES
  ('agent', 'devis.create'),
  ('chef_service', 'devis.create'),
  ('admin', 'devis.create'),
  ('dg', 'devis.create'),
  ('daf', 'devis.create'),
  ('agent', 'devis.send'),
  ('chef_service', 'devis.send'),
  ('admin', 'devis.send'),
  ('dg', 'devis.send'),
  ('daf', 'devis.send')
ON CONFLICT (role, permission) DO NOTHING;
