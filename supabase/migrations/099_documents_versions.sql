-- ============================================================================
-- 099 — DOC : versions de documents (cahier §11, lot G4 — 13/09/2026)
-- Remplacer une pièce N'EFFACE JAMAIS l'ancienne : le nouveau fichier
-- porte version+1 et référence le document remplacé (replaces_id) ;
-- l'ancien passe en statut_controle='remplace' (087) et reste consultable.
-- Les liens temporaires (URL signée 1 h, auditée) sont servis par la route
-- /api/demandes/:id/documents/:docId/lien-temporaire — aucun schéma requis.
-- Additif uniquement.
-- ============================================================================

ALTER TABLE public.demande_documents
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS replaces_id uuid REFERENCES public.demande_documents(id);

CREATE INDEX IF NOT EXISTS idx_demande_documents_replaces
  ON public.demande_documents(replaces_id);
