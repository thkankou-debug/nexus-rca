-- NE JAMAIS REJOUER SUR UNE BASE EXISTANTE.
-- Recupere le 08/09/2026 depuis supabase_migrations.schema_migrations
-- (version 20260504215658) : applique en base le 04/05/2026, jamais
-- committe en fichier .sql jusqu'ici. Fait partie du trou "001-017"
-- documente dans CLAUDE.md/la feuille de route -- partiellement
-- recuperable, contrairement a ce qui etait suppose. Texte exact tire
-- de statements en base (pas une reconstruction par introspection comme
-- 000_schema_baseline.sql), fourni ici pour tracabilite historique
-- uniquement.

-- Phase 5 step A : étendre les enums payment_method et payment_status
-- avec les valeurs canoniques anglaises du système unifié.
-- Les anciennes valeurs FR sont conservées pour compatibilité.
-- Doit être appliqué AVANT 003b (les UPDATE de backfill utilisent les nouvelles valeurs).

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'stripe';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'orange_money';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'mtn_money';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';

ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'failed';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'validated';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'voided';
