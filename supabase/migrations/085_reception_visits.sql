-- ============================================================================
-- 085 — FILE D'ACCUEIL (cahier des charges §7.3 : « la file d'accueil
-- enregistre arrivée, motif, prise en charge et orientation » ; maquette
-- ACCEUIL, bloc « Accueil des clients »).
--
-- Proposition §14.2 :
-- - Propriétaire métier : la réception (created_by). 1 ligne = 1 arrivée
--   physique. client_record_id nullable : un visiteur peut être reçu avant
--   d'avoir une fiche (CRM-03) ; demande_id nullable : renseigné quand
--   l'arrivée débouche sur un dossier (orientation).
-- - États : en_attente → en_charge → orientee | partie (motif libre).
-- - Index sur (status, arrived_at) pour la file du jour.
-- - RLS : lecture staff d'accueil/supervision via routes service-role
--   (aucune policy d'écriture client — refus par défaut, SEC-01, même
--   patron que instructions). Pas d'estimation d'attente affichée (§7.3 :
--   seulement si méthode et données existent — elles n'existent pas).
-- - Rétention : aucune suppression ; backfill : aucun (objet nouveau).
-- ============================================================================

CREATE TABLE public.reception_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  motif text NOT NULL,
  client_record_id uuid REFERENCES public.clients(id),
  demande_id uuid REFERENCES public.demandes(id),
  status text NOT NULL DEFAULT 'en_attente'
    CHECK (status IN ('en_attente', 'en_charge', 'orientee', 'partie')),
  arrived_at timestamptz NOT NULL DEFAULT now(),
  taken_by uuid REFERENCES public.profiles(id),
  taken_at timestamptz,
  closed_at timestamptz,
  notes text,
  is_test boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reception_visits_file
  ON public.reception_visits(status, arrived_at);
CREATE INDEX idx_reception_visits_client
  ON public.reception_visits(client_record_id)
  WHERE client_record_id IS NOT NULL;

CREATE TRIGGER trg_reception_visits_updated_at
  BEFORE UPDATE ON public.reception_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.reception_visits ENABLE ROW LEVEL SECURITY;

-- Lecture : accueil (ses propres enregistrements) + supervision admin.
CREATE POLICY "Reception can read own visits" ON public.reception_visits
  FOR SELECT USING (created_by = (SELECT auth.uid()));
CREATE POLICY "Admin can read visits" ON public.reception_visits
  FOR SELECT USING (is_admin((SELECT auth.uid())));
