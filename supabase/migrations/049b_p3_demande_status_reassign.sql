-- ============================================================================
-- 049b — P3 lot 5, etape 2/2 : reassignation des 16 dossiers reels
--
-- Correspondance confirmee par Thierry :
--   nouveau            -> nouvelle_demande  (9 dossiers)
--   en_cours           -> traitement        (4 dossiers)
--   en_traitement      -> traitement        (1 dossier)
--   complete           -> termine           (1 dossier)
--   annule             -> annule            (1 dossier, inchange)
-- Aucun dossier reel n'est actuellement en_attente/incomplet — ces valeurs
-- de l'ancien enum ne concernent donc aucune ligne a ce jour.
-- ============================================================================

UPDATE public.demandes SET statut = 'nouvelle_demande' WHERE statut = 'nouveau';
UPDATE public.demandes SET statut = 'traitement' WHERE statut IN ('en_cours', 'en_traitement');
UPDATE public.demandes SET statut = 'termine' WHERE statut = 'complete';
-- annule : aucune action, deja la valeur cible.
