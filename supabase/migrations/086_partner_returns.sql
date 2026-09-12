-- ============================================================================
-- 086 — RETOURS PARTENAIRES (cahier des charges §5.10 : « accuser réception,
-- demander un complément, déposer un document ou un avis, indiquer une
-- décision partenaire. Le retour ne clôt pas automatiquement le dossier »).
--
-- Proposition §14.2 : les retours ne passent NI par demande_messages (canal
-- client — un partenaire n'écrit jamais au client) NI par demande_notes
-- (notes internes staff, invisibles au partenaire qui doit pouvoir relire
-- ses propres dépôts). Table dédiée :
-- - 1 ligne = 1 retour d'un partenaire sur un dossier partagé.
-- - types : accuse | avis | decision | complement_demande.
-- - RLS : le partenaire lit SES retours ; le staff lit tout (vérification
--   avant décision interne, flux §3.1) ; écritures service-role uniquement
--   (la route vérifie que le partage existe ENCORE — une révocation bloque
--   page, API et dépôt, R17).
-- - Rétention : aucune suppression ; backfill : aucun (objet nouveau).
-- ============================================================================

CREATE TABLE public.partner_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  partenaire_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL CHECK (type IN ('accuse', 'avis', 'decision', 'complement_demande')),
  content text NOT NULL,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_returns_demande ON public.partner_returns(demande_id);
CREATE INDEX idx_partner_returns_partenaire ON public.partner_returns(partenaire_id);

ALTER TABLE public.partner_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partenaire can read own returns" ON public.partner_returns
  FOR SELECT USING (partenaire_id = (SELECT auth.uid()));
CREATE POLICY "Staff can read partner_returns" ON public.partner_returns
  FOR SELECT USING (is_staff((SELECT auth.uid())));
