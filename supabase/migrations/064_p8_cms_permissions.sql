-- ============================================================================
-- 064 — P8 : permissions CMS manquantes (role_permissions)
--
-- 'cms.content.write' seule seedee en 043b (admin/moderateur). Les 3 autres
-- ressources CMS de l'enumeration §P2 (cms.service.write, cms.faq.write,
-- cms.partenaire.write) n'avaient jamais ete seedees. Ajoutees ensemble
-- (meme mouvement, avant que les 3 ecrans n'existent tous) — meme pratique
-- que 043b pour role_permissions sur des ressources anticipees.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'cms.service.write'),
  ('admin', 'cms.faq.write'),
  ('moderateur', 'cms.faq.write'),
  ('admin', 'cms.partenaire.write')
ON CONFLICT (role, permission) DO NOTHING;
