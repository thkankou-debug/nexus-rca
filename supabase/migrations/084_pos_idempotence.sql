-- ============================================================================
-- 084 — CAI-05 (cahier des charges §8.3) : « un double clic, une nouvelle
-- tentative après délai réseau ou un webhook répété ne crée jamais deux
-- paiements. Une clé d'idempotence permet de retrouver le résultat initial. »
--
-- Proposition §14.2 : deux colonnes additives sur quick_sales —
-- - ticket_key uuid : clé d'idempotence générée par le POS au moment où le
--   ticket est constitué ; toutes les lignes d'un même ticket la partagent.
-- - ligne_index int : position de la ligne dans le ticket.
-- Contrainte UNIQUE (ticket_key, ligne_index) partielle : un rejeu du même
-- ticket lève 23505 → la route renvoie le résultat INITIAL (lignes lues par
-- ticket_key) au lieu d'insérer un doublon. NULL sur les lignes historiques
-- (aucun backfill nécessaire, l'unicité ne s'applique qu'aux nouvelles).
-- Bonus CAI-06/07 : ticket_key regroupe les lignes d'un même reçu — la
-- réimpression reconstruit le ticket complet depuis la base.
-- ============================================================================

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS ticket_key uuid,
  ADD COLUMN IF NOT EXISTS ligne_index integer;

CREATE UNIQUE INDEX IF NOT EXISTS uq_quick_sales_ticket_ligne
  ON public.quick_sales(ticket_key, ligne_index)
  WHERE ticket_key IS NOT NULL;

COMMENT ON COLUMN public.quick_sales.ticket_key IS
  'Clé d''idempotence du ticket POS (CAI-05) — partagée par toutes les lignes d''un même encaissement.';
