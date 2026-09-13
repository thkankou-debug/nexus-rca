-- ============================================================================
-- 091 — CAISSE : session ouverte OBLIGATOIRE au niveau base de données
-- (Cahier Accueil & caisse 12/09/2026 §2 et §11 : « La protection doit
-- exister côté serveur et base de données. Désactiver un bouton ne suffit
-- pas. ») Défaut constaté : la « Caisse rapide » de l'espace agent insérait
-- dans quick_sales directement depuis le navigateur, sans session.
--
-- 1) quick_sales.session_id : chaque encaissement comptoir est rattaché à
--    LA session ouverte de son opérateur — rempli par trigger, jamais par
--    le client. Historique (14 lignes) : session_id NULL, SIGNALÉ mais
--    jamais rattaché arbitrairement à une journée (§11).
-- 2) Trigger BEFORE INSERT : aucune session ouverte → exception
--    CAISSE_FERMEE. Vaut pour TOUTES les portes (accueil, POS, agent,
--    anciennes routes, SQL direct).
-- 3) Trigger BEFORE UPDATE/DELETE : une vente d'une session soumise ou
--    clôturée est figée (aucune modification silencieuse d'une journée
--    close — §6). L'application ne modifie jamais quick_sales : aucun
--    flux existant n'est cassé.
-- 4) Une seule session ouverte par opérateur : l'unicité n'était
--    qu'applicative, elle devient un index partiel unique.
-- ============================================================================

ALTER TABLE public.quick_sales
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.caisse_sessions(id);

CREATE INDEX IF NOT EXISTS idx_quick_sales_session ON public.quick_sales(session_id);

-- Une seule session « ouverte » par opérateur, garanti par la base.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_caisse_session_ouverte_par_agent
  ON public.caisse_sessions(agent_id)
  WHERE status = 'ouverte';

CREATE OR REPLACE FUNCTION public.quick_sales_require_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  operateur uuid;
  sid uuid;
BEGIN
  operateur := COALESCE(NEW.created_by, NEW.agent_id, (SELECT auth.uid()));
  IF operateur IS NULL THEN
    RAISE EXCEPTION 'CAISSE_FERMEE: operateur inconnu — encaissement refuse';
  END IF;
  SELECT id INTO sid
  FROM public.caisse_sessions
  WHERE agent_id = operateur AND status = 'ouverte'
  ORDER BY opened_at DESC
  LIMIT 1;
  IF sid IS NULL THEN
    RAISE EXCEPTION 'CAISSE_FERMEE: ouvrez votre session de caisse avant tout encaissement';
  END IF;
  NEW.session_id := sid;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quick_sales_require_session ON public.quick_sales;
CREATE TRIGGER trg_quick_sales_require_session
  BEFORE INSERT ON public.quick_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.quick_sales_require_session();

CREATE OR REPLACE FUNCTION public.quick_sales_lock_closed_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.session_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.caisse_sessions s
    WHERE s.id = OLD.session_id AND s.status <> 'ouverte'
  ) THEN
    RAISE EXCEPTION 'SESSION_CLOTUREE: transaction d''une session soumise ou cloturee — non modifiable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quick_sales_lock_closed ON public.quick_sales;
CREATE TRIGGER trg_quick_sales_lock_closed
  BEFORE UPDATE OR DELETE ON public.quick_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.quick_sales_lock_closed_session();
