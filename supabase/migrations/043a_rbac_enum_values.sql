-- ============================================================================
-- 043a — RBAC 9 ROLES (P2), etape 1/2 : extension de l'enum user_role
--
-- Separee de 043b : Postgres refuse d'utiliser une valeur d'enum tout juste
-- ajoutee dans la meme transaction ("unsafe use of new value ... New enum
-- values must be committed before they can be used"). Cette migration doit
-- etre committee avant que 043b (qui compare `role` a 'dg', 'daf', etc.)
-- puisse s'executer.
--
-- NOTE NUMEROTATION : une migration "042_contact_demandes" est appliquee en
-- base (11/05/2026, version 20260511220546) sans fichier .sql committe —
-- meme type de trou que 001-017, decouvert en verifiant P1b/P1c. Non corrige
-- ici (hors perimetre P2) ; cette migration est numerotee 043 pour ne pas
-- reutiliser un numero deja consomme dans l'historique.
-- ============================================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dg';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'daf';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chef_service';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'comptable';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moderateur';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partenaire';
