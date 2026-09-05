-- ============================================================================
-- 049a — P3 lot 5, etape 1/2 : extension de demande_status (7 -> 15 valeurs)
--
-- Additif pur : les 7 valeurs actuelles restent dans le type (aucune
-- suppression possible proprement sur un enum Postgres, et la regle P3 est
-- de toute facon de ne jamais retirer). Separee de 049b (reassignation des
-- donnees) pour la meme raison que 043a/043b : Postgres refuse d'utiliser
-- une valeur d'enum dans la meme transaction que son ajout.
--
-- Correspondance confirmee par Thierry, appliquee dans 049b :
--   nouveau/en_cours/en_traitement -> traitement ou nouvelle_demande (detail en 049b)
--   incomplet          -> dossier_incomplet
--   en_attente         -> documents_demandes
--   complete           -> termine
--   annule             -> annule (deja present, inchange)
-- ============================================================================

ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'nouvelle_demande';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'qualification';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'documents_demandes';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'dossier_incomplet';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'etude_faisabilite';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'devis_envoye';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'devis_accepte';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'paiement_attente';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'traitement';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'transmis_partenaire';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'decision_recue';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'termine';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'refuse';
ALTER TYPE demande_status ADD VALUE IF NOT EXISTS 'archive';
