-- ============================================================================
-- 075 — L3 Étape 2b : l'agent peut lire/écrire les notes internes de ses
-- propres dossiers (décision Thierry, 09/09/2026, BRIEF_L2_L3_POUR_CLAUDE_CODE.md).
--
-- Additif : la policy admin_super_admin_all_notes existante n'est pas
-- touchée. Nouvelle policy ALL, restreinte au dossier assigné à l'agent
-- (agent_id = auth.uid() sur la demande parente). Le client n'a toujours
-- aucun accès (aucune policy ne le couvre).
-- ============================================================================

CREATE POLICY agent_own_dossier_notes ON public.demande_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'agent'
    )
    AND EXISTS (
      SELECT 1 FROM public.demandes d
      WHERE d.id = demande_notes.demande_id AND d.agent_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'agent'
    )
    AND EXISTS (
      SELECT 1 FROM public.demandes d
      WHERE d.id = demande_notes.demande_id AND d.agent_id = (SELECT auth.uid())
    )
  );
