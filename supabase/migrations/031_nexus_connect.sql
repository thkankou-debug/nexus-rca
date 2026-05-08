-- ============================================================================
-- NEXUS RCA — Migration 031 : Nexus Connect Client
-- timeline + messages + documents demandés + affectation agent auto
-- (déjà appliquée via MCP — fichier conservé pour traçabilité)
-- ============================================================================

-- 1. Colonnes additionnelles sur `demandes`
ALTER TABLE public.demandes
  ADD COLUMN IF NOT EXISTS current_step int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_step_label text DEFAULT 'Dossier reçu';

-- 2. Table historique des changements de statut
CREATE TABLE IF NOT EXISTS public.demande_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  step int NOT NULL,
  step_label text NOT NULL,
  changed_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_status_history_demande
  ON public.demande_status_history(demande_id, created_at);

-- 3. Table documents demandés par conseiller
CREATE TABLE IF NOT EXISTS public.demande_documents_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES public.profiles(id),
  type_document text NOT NULL,
  description text,
  statut text NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente', 'fourni', 'annule')),
  fulfilled_by_document_id uuid REFERENCES public.demande_documents(id) ON DELETE SET NULL,
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_doc_requests_demande
  ON public.demande_documents_requests(demande_id, statut);

-- 4. Table messages client ↔ conseiller
CREATE TABLE IF NOT EXISTS public.demande_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id),
  author_name text NOT NULL,
  author_role text NOT NULL,
  content text NOT NULL CHECK (length(content) <= 1000),
  read_by_recipient boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_demande
  ON public.demande_messages(demande_id, created_at);

-- 5. RLS
ALTER TABLE public.demande_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demande_documents_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demande_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_status_history" ON public.demande_status_history
  FOR ALL USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "client_read_own_status_history" ON public.demande_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM demandes d WHERE d.id = demande_status_history.demande_id
    AND (d.client_id = auth.uid() OR
         lower(trim(d.email)) = (SELECT lower(trim(email)) FROM profiles WHERE id = auth.uid()))
  ));

CREATE POLICY "staff_all_doc_requests" ON public.demande_documents_requests
  FOR ALL USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "client_read_own_doc_requests" ON public.demande_documents_requests
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM demandes d WHERE d.id = demande_documents_requests.demande_id
    AND (d.client_id = auth.uid() OR
         lower(trim(d.email)) = (SELECT lower(trim(email)) FROM profiles WHERE id = auth.uid()))
  ));

CREATE POLICY "staff_all_messages" ON public.demande_messages
  FOR ALL USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "client_read_own_messages" ON public.demande_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM demandes d WHERE d.id = demande_messages.demande_id
    AND (d.client_id = auth.uid() OR
         lower(trim(d.email)) = (SELECT lower(trim(email)) FROM profiles WHERE id = auth.uid()))
  ));
CREATE POLICY "client_insert_own_messages" ON public.demande_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM demandes d WHERE d.id = demande_messages.demande_id
    AND (d.client_id = auth.uid() OR
         lower(trim(d.email)) = (SELECT lower(trim(email)) FROM profiles WHERE id = auth.uid()))
  ));

-- 6. Trigger affectation auto agent (round-robin)
CREATE OR REPLACE FUNCTION public.assign_demande_to_agent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE selected uuid;
BEGIN
  IF NEW.agent_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT p.id INTO selected
  FROM profiles p
  LEFT JOIN demandes d ON d.agent_id = p.id
    AND d.statut IN ('nouveau','en_cours','en_traitement')
  WHERE p.role = 'agent' AND COALESCE(p.actif, TRUE) = TRUE
  GROUP BY p.id ORDER BY COUNT(d.id) ASC, RANDOM() LIMIT 1;
  NEW.agent_id := selected;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_demande_agent ON public.demandes;
CREATE TRIGGER trg_assign_demande_agent
  BEFORE INSERT ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.assign_demande_to_agent();

-- 7. Backfill : current_step pour demandes existantes
UPDATE public.demandes
SET current_step = 1, current_step_label = 'Dossier reçu'
WHERE current_step IS NULL;
