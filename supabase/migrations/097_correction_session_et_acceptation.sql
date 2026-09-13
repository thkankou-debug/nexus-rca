-- ============================================================================
-- 097 — LOT G1+G2 (cahier Administration, 12/09/2026 soir)
--
-- G2 · §8.5 état « correction demandée » : le valideur (DAF/habilité) peut
-- RENVOYER une session soumise à sa titulaire au lieu de la clôturer —
-- motif obligatoire, valeurs initiales conservées (les transactions
-- restent FIGÉES par les triggers 091/093 : status <> 'ouverte'), la
-- titulaire re-compte et re-soumet.
--
-- G1 · §7.3 acceptation d'affectation : l'agent ACCEPTE ou REFUSE (motif)
-- un dossier qui lui est affecté ; NULL = dossiers historiques (aucun
-- blocage rétroactif). L'escalade sur silence > 24 h passe par le cron
-- d'escalades existant.
-- Additif uniquement.
-- ============================================================================

ALTER TABLE public.caisse_sessions DROP CONSTRAINT IF EXISTS caisse_sessions_status_check;
ALTER TABLE public.caisse_sessions ADD CONSTRAINT caisse_sessions_status_check
  CHECK (status = ANY (ARRAY['ouverte'::text, 'a_cloturer'::text, 'correction_demandee'::text, 'cloturee'::text]));

ALTER TABLE public.caisse_sessions
  ADD COLUMN IF NOT EXISTS correction_motif text,
  ADD COLUMN IF NOT EXISTS correction_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS correction_at timestamptz;

COMMENT ON COLUMN public.caisse_sessions.correction_motif IS
  'Motif du renvoi en correction par le valideur (§8.5) — obligatoire côté route.';

ALTER TABLE public.demandes
  ADD COLUMN IF NOT EXISTS acceptation_status text
    CHECK (acceptation_status IN ('en_attente', 'acceptee', 'refusee')),
  ADD COLUMN IF NOT EXISTS acceptation_at timestamptz,
  ADD COLUMN IF NOT EXISTS acceptation_motif text;

COMMENT ON COLUMN public.demandes.acceptation_status IS
  '§7.3 : en_attente à l''affectation, acceptee/refusee par l''agent (motif si refus). NULL = antérieur au dispositif.';

CREATE INDEX IF NOT EXISTS idx_demandes_acceptation
  ON public.demandes(agent_id) WHERE acceptation_status = 'en_attente';
