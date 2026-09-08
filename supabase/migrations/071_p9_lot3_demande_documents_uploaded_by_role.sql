-- 071 — P9 Lot 3 : documents officiels delivres par l'agence, distincts des
-- pieces fournies par le client. Colonne uploaded_by_role plutot qu'une
-- nouvelle table (pas de 5e mecanisme, decision de Thierry 07/09/2026).
-- Valeur posee par l'API au moment de l'upload (jamais fournie par le
-- client), jamais par defaut DB — le contexte (qui uploade) n'existe qu'a
-- l'execution.
ALTER TABLE public.demande_documents
  ADD COLUMN uploaded_by_role text CHECK (uploaded_by_role IN ('client', 'agence'));

-- Backfill honnete : verifie le role reel de l'auteur de chaque document
-- existant plutot que de supposer une valeur unique pour tous.
UPDATE public.demande_documents dd
SET uploaded_by_role = CASE
  WHEN p.role = 'client' THEN 'client'
  ELSE 'agence'
END
FROM public.profiles p
WHERE p.id = dd.uploaded_by
  AND dd.uploaded_by_role IS NULL;
