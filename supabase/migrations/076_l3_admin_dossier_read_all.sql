-- ============================================================================
-- 076 — L3 Étape 3 : admin n'avait aucune ligne dossier.read.* dans
-- role_permissions (trouvé en câblant getEffectiveNav() sur has_permission()).
-- Sans elle, le futur menu réel n'affiche jamais "Dossiers" pour admin, alors
-- que le RLS actuel lui donne déjà un accès total (is_staff()). Corrige le
-- catalogue pour qu'il reflète la réalité — additif, pas de retrait.
-- ============================================================================

INSERT INTO public.role_permissions (role, permission)
VALUES ('admin', 'dossier.read.all')
ON CONFLICT DO NOTHING;
