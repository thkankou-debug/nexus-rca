-- ============================================================================
-- 045 — P3 : devis, devis_lignes, factures, facture_lignes, echeanciers,
-- categories_compta, caisse_sessions, commissions
--
-- Schema fondation uniquement — la numerotation par sequence (DEV-YYYY-NNNNNN,
-- FAC-YYYY-NNNNNN) et le detail fonctionnel (PDF, validation) sont du P6.
-- Toutes internes staff (aucun acces client/anon direct dans cette phase).
-- ============================================================================

CREATE TABLE public.devis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  demande_id uuid REFERENCES public.demandes(id) ON DELETE SET NULL,
  client_record_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  valid_until date,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage devis" ON public.devis
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.devis_lignes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id uuid NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  ordre int NOT NULL DEFAULT 0
);
ALTER TABLE public.devis_lignes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage devis_lignes" ON public.devis_lignes
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.factures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  devis_id uuid REFERENCES public.devis(id) ON DELETE SET NULL,
  demande_id uuid REFERENCES public.demandes(id) ON DELETE SET NULL,
  client_record_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'validee', 'payee', 'annulee')),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  due_date date,
  validated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage factures" ON public.factures
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.facture_lignes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid NOT NULL REFERENCES public.factures(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  ordre int NOT NULL DEFAULT 0
);
ALTER TABLE public.facture_lignes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage facture_lignes" ON public.facture_lignes
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.echeanciers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid REFERENCES public.factures(id) ON DELETE CASCADE,
  demande_id uuid REFERENCES public.demandes(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'a_venir' CHECK (status IN ('a_venir', 'paye', 'en_retard')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.echeanciers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage echeanciers" ON public.echeanciers
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.categories_compta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  type text NOT NULL CHECK (type IN ('revenu', 'depense')),
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories_compta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage categories_compta" ON public.categories_compta
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.caisse_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  opening_balance numeric NOT NULL DEFAULT 0,
  expected_balance numeric,
  actual_balance numeric,
  discrepancy numeric,
  status text NOT NULL DEFAULT 'ouverte' CHECK (status IN ('ouverte', 'cloturee')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.caisse_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent can read own caisse_sessions" ON public.caisse_sessions
  FOR SELECT USING (agent_id = (select auth.uid()));
CREATE POLICY "Agent can insert own caisse_sessions" ON public.caisse_sessions
  FOR INSERT WITH CHECK (agent_id = (select auth.uid()));
CREATE POLICY "Staff can manage caisse_sessions" ON public.caisse_sessions
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));

CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  demande_id uuid REFERENCES public.demandes(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  rate numeric,
  status text NOT NULL DEFAULT 'calculee' CHECK (status IN ('calculee', 'validee', 'payee')),
  validated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent can read own commissions" ON public.commissions
  FOR SELECT USING (agent_id = (select auth.uid()));
CREATE POLICY "Staff can manage commissions" ON public.commissions
  FOR ALL USING (is_staff((select auth.uid()))) WITH CHECK (is_staff((select auth.uid())));
