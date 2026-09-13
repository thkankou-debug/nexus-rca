-- ============================================================================
-- 050 — P3 : backfill de demandes.client_record_id (prevu par C0 §7)
--
-- 12 des 16 dossiers reels ont client_id renseigne, couvrant 5 profils
-- distincts. Un seul (grothejohnmike@gmail.com) avait deja une fiche
-- clients (via profile_id). Cree les 4 fiches manquantes (creation
-- deterministe par profile_id, pas un dedoublonnage ambigu — C0 §6 ne
-- s'applique pas ici, aucune fusion humaine a arbitrer), puis renseigne
-- client_record_id sur les 12 lignes.
-- ============================================================================

INSERT INTO public.clients (type, nom, prenom, email, telephone, pays, profile_id)
SELECT 'particulier', p.nom, p.prenom, p.email, p.telephone, p.pays, p.id
FROM public.profiles p
WHERE p.id IN (
  'a9b654ba-916a-4cb8-a73e-fe8d803992dd',
  'a0844ebe-3fc4-4760-b1da-c81f3f727880',
  'a9ca2f4e-0265-40e7-a8d8-1e605023fe57',
  '89a6f7b2-4af6-46c8-b3e6-049a5979d849'
)
AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.profile_id = p.id);

UPDATE public.demandes d
SET client_record_id = c.id
FROM public.clients c
WHERE d.client_id = c.profile_id
  AND d.client_record_id IS NULL;
