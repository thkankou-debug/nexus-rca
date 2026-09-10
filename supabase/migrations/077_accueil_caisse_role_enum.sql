-- ============================================================================
-- 077 — NEXUS_RCA_DASHBOARD_ADMINISTRATION.md, Partie 5 étape 1 : nouveau
-- rôle accueil_caisse (poste physique de réception/caisse, distinct du
-- comptable qui ne reçoit pas de public, et de l'agent qui ne manipule pas
-- d'espèces).
--
-- Séparée de 078 (permissions) : Postgres refuse d'utiliser une valeur
-- d'enum tout juste ajoutée dans la même transaction — même leçon que
-- 043a/043b (P2, RBAC 9 rôles).
-- ============================================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accueil_caisse';
