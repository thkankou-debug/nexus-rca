-- ============================================================================
-- 083 — INSTRUCTIONS (cahier des charges §10, GO Thierry 12/09/2026).
--
-- Proposition §14.2 (propriétaire, FK, cardinalités, index, contraintes,
-- RLS, rétention, backfill) :
-- - `instructions` (1) ←→ (N) `instruction_recipients`. Propriétaire métier :
--   l'émetteur (author_id). Une instruction est une DÉCISION à prendre en
--   charge puis exécuter — distincte d'un message, d'une note et d'une
--   tâche (§10.1). Nomenclature anglaise (§14.1).
-- - Statut GLOBAL volontairement réduit : brouillon / envoyee / cloturee /
--   annulee. Les états « reçue, prise en charge, en cours, bloquée,
--   soumise » sont PAR DESTINATAIRE (instruction_recipients.status) — le
--   cahier exige des accusés individuels, jamais un statut global unique
--   quand il y a plusieurs destinataires. L'état apparent (« bloquée » si
--   un destinataire bloque) est dérivé à l'affichage.
-- - Référence INS-YYYY-NNNNNN par séquence (patron devis/factures, 059).
-- - RLS : émetteur et destinataires lisent ; toutes les écritures passent
--   par les routes service-role gardées par permission (aucune policy
--   INSERT/UPDATE côté client — refus par défaut, SEC-01).
-- - Rétention : aucune suppression (annulation avec motif, comme partout).
-- - Backfill : aucun (objet nouveau, 0 ligne).
--
-- Permission : instruction.create (dg, admin, chef_service — flux §3.1 :
-- DG → responsables, Admin → équipes, Chef → agents ; super_admin passe
-- toujours). L'accusé/avancement d'un destinataire et la clôture par
-- l'émetteur sont des contrôles d'appartenance, pas des permissions.
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.instructions_ref_seq;

CREATE OR REPLACE FUNCTION public.gen_instruction_ref()
RETURNS text
LANGUAGE sql
SET search_path TO 'public'
AS $$
  SELECT 'INS-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.instructions_ref_seq')::text, 6, '0');
$$;

CREATE TABLE public.instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL DEFAULT public.gen_instruction_ref(),
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  author_role text NOT NULL, -- rôle AU MOMENT de l'émission (§10.1)
  subject text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'normale'
    CHECK (priority IN ('basse', 'normale', 'haute', 'critique')),
  due_date date,
  confidential boolean NOT NULL DEFAULT false,
  requires_ack boolean NOT NULL DEFAULT true,
  demande_id uuid REFERENCES public.demandes(id),
  status text NOT NULL DEFAULT 'envoyee'
    CHECK (status IN ('brouillon', 'envoyee', 'cloturee', 'annulee')),
  closed_by uuid REFERENCES public.profiles(id),
  closed_at timestamptz,
  close_note text,
  cancel_reason text,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_instructions_author ON public.instructions(author_id);
CREATE INDEX idx_instructions_status ON public.instructions(status);
CREATE INDEX idx_instructions_demande ON public.instructions(demande_id)
  WHERE demande_id IS NOT NULL;

CREATE TRIGGER trg_instructions_updated_at
  BEFORE UPDATE ON public.instructions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.instruction_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction_id uuid NOT NULL REFERENCES public.instructions(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id),
  is_lead boolean NOT NULL DEFAULT false, -- responsable principal (§10.1)
  acked_at timestamptz,                    -- accusé de réception INDIVIDUEL
  status text NOT NULL DEFAULT 'recue'
    CHECK (status IN ('recue', 'prise_en_charge', 'en_cours', 'bloquee', 'soumise', 'terminee')),
  status_note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instruction_id, recipient_id)
);

CREATE INDEX idx_instruction_recipients_recipient
  ON public.instruction_recipients(recipient_id);

CREATE TRIGGER trg_instruction_recipients_updated_at
  BEFORE UPDATE ON public.instruction_recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS : lecture émetteur + destinataires ; aucune écriture directe client.
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Author or recipient can read instructions" ON public.instructions
  FOR SELECT USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.instruction_recipients r
      WHERE r.instruction_id = instructions.id
        AND r.recipient_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Author or recipient can read instruction_recipients" ON public.instruction_recipients
  FOR SELECT USING (
    recipient_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.instructions i
      WHERE i.id = instruction_recipients.instruction_id
        AND i.author_id = (SELECT auth.uid())
    )
  );

INSERT INTO public.role_permissions (role, permission) VALUES
  ('dg', 'instruction.create'),
  ('admin', 'instruction.create'),
  ('chef_service', 'instruction.create')
ON CONFLICT DO NOTHING;
