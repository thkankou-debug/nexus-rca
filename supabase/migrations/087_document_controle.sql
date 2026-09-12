-- ============================================================================
-- 087 — DOC-01/DOC-02 (cahier des charges §11) : statut de CONTRÔLE des
-- pièces. « L'interface distingue reçu, vérifié, rejeté et remplacé » —
-- concept absent du schéma jusqu'ici (constat A4 #2, faux zéros évités
-- depuis). Additif :
-- - statut_controle : recu (défaut — la réception collecte, le service
--   compétent valide, §3.4) → verifie | rejete ; remplace quand une
--   nouvelle version de la même pièce est déposée.
-- - controle_motif : obligatoire au rejet (appliqué par la route).
-- - controlled_by / controlled_at : qui a contrôlé, quand.
-- Aucun backfill : les pièces existantes restent « recu » (état vrai —
-- personne ne les a formellement contrôlées).
-- ============================================================================

ALTER TABLE public.demande_documents
  ADD COLUMN IF NOT EXISTS statut_controle text NOT NULL DEFAULT 'recu'
    CHECK (statut_controle IN ('recu', 'verifie', 'rejete', 'remplace')),
  ADD COLUMN IF NOT EXISTS controle_motif text,
  ADD COLUMN IF NOT EXISTS controlled_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS controlled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_demande_documents_controle
  ON public.demande_documents(demande_id, statut_controle);
