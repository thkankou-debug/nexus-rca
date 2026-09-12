-- ============================================================================
-- 093 — CAISSE : entrées/sorties de fonds hors vente (cahier §5, 12/09/2026)
-- « Toute entrée ou sortie hors vente doit comporter un type, un montant,
--   un motif, un auteur et les justificatifs ou autorisations nécessaires.
--   Aucun ajustement direct et inexpliqué du solde. »
--
-- Le journal des mouvements ne couvrait que les ventes : cette table ajoute
-- les mouvements de fonds physiques (apport de monnaie, remise en banque,
-- retrait autorisé…). Ils entrent dans le solde théorique :
--   solde théorique = fonds d'ouverture + entrées physiques nettes − sorties
-- (lib/caisse-server.ts, source unique).
--
-- Verrous (mêmes principes que 091) :
--   · INSERT : uniquement sur SA session OUVERTE (trigger) ;
--   · UPDATE/DELETE : mouvements d'une session soumise/clôturée FIGÉS.
-- Écritures uniquement via l'API (service-role) : RLS activée, lecture
-- limitée à l'auteur, aucune policy d'écriture pour les clients.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.caisse_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.caisse_sessions(id),
  type text NOT NULL CHECK (type IN ('entree', 'sortie')),
  montant numeric NOT NULL CHECK (montant > 0),
  motif text NOT NULL CHECK (length(btrim(motif)) >= 3),
  justificatif text,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_test boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_caisse_movements_session ON public.caisse_movements(session_id);

ALTER TABLE public.caisse_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author reads own movements" ON public.caisse_movements;
CREATE POLICY "Author reads own movements"
  ON public.caisse_movements FOR SELECT
  USING (created_by = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.caisse_movements_require_open_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.caisse_sessions s
    WHERE s.id = NEW.session_id AND s.status = 'ouverte'
  ) THEN
    RAISE EXCEPTION 'CAISSE_FERMEE: mouvement de fonds refuse — la session n''est pas ouverte';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_caisse_movements_open ON public.caisse_movements;
CREATE TRIGGER trg_caisse_movements_open
  BEFORE INSERT ON public.caisse_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.caisse_movements_require_open_session();

CREATE OR REPLACE FUNCTION public.caisse_movements_lock_closed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.caisse_sessions s
    WHERE s.id = OLD.session_id AND s.status <> 'ouverte'
  ) THEN
    RAISE EXCEPTION 'SESSION_CLOTUREE: mouvement d''une session soumise ou cloturee — non modifiable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_caisse_movements_lock ON public.caisse_movements;
CREATE TRIGGER trg_caisse_movements_lock
  BEFORE UPDATE OR DELETE ON public.caisse_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.caisse_movements_lock_closed();
