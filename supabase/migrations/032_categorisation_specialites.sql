-- ============================================================================
-- NEXUS RCA — Migration 032 : catégorisation dossiers + spécialités agents
-- À EXÉCUTER MANUELLEMENT dans Supabase SQL Editor (ou via MCP avec GO explicite)
-- Cible : projet nexus-rca-new (ipvoqpvqpxbleonnqhgr / yyoptsxdoekbmibkwikj actif)
-- ============================================================================
-- NOTE bug `assigne_a` : la colonne n'existe PAS en DB. Aucun renommage à
-- faire. Les 3 fichiers TypeScript fautifs sont corrigés côté code.

-- ─── 1. Colonne `categorie_dossier` sur `demandes` ──────────────────────────
ALTER TABLE public.demandes
  ADD COLUMN IF NOT EXISTS categorie_dossier text;

ALTER TABLE public.demandes DROP CONSTRAINT IF EXISTS demandes_categorie_dossier_check;
ALTER TABLE public.demandes
  ADD CONSTRAINT demandes_categorie_dossier_check
  CHECK (categorie_dossier IS NULL OR categorie_dossier IN (
    'visa',
    'etudes_bourses',
    'billets_hotels',
    'assurances',
    'financement_incubateur',
    'digitalisation',
    'recouvrement',
    'transferts',
    'autres'
  ));

CREATE INDEX IF NOT EXISTS idx_demandes_categorie_dossier
  ON public.demandes(categorie_dossier, statut);

CREATE INDEX IF NOT EXISTS idx_demandes_agent_statut
  ON public.demandes(agent_id, statut);

-- ─── 2. Colonne `specialites` sur `profiles` ────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS specialites text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_specialites
  ON public.profiles USING GIN (specialites);

-- ─── 3. Fonction de mapping service → catégorie (normalisation par mots-clés)
CREATE OR REPLACE FUNCTION public.map_service_to_categorie(p_service text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE s text := COALESCE(lower(p_service), '');
BEGIN
  IF s ~ '(visa|e-?visa)' THEN RETURN 'visa'; END IF;
  IF s ~ '(étud|etud|bourse|tcf|ielts|orient)' THEN RETURN 'etudes_bourses'; END IF;
  IF s ~ '(billet|vol|hôtel|hotel|voyage)' THEN RETURN 'billets_hotels'; END IF;
  IF s ~ '(assurance|santé|sante)' THEN RETURN 'assurances'; END IF;
  IF s ~ '(incubateur|financement|investiss|partenariat|business)' THEN RETURN 'financement_incubateur'; END IF;
  IF s ~ '(digital|site web|application|app mobile|marketing)' THEN RETURN 'digitalisation'; END IF;
  IF s ~ '(recouvrement|acte|diplôme|diplome|légalisation|legalisation|apostille|casier|bulletin)' THEN RETURN 'recouvrement'; END IF;
  IF s ~ '(transfert|change|mobile money)' THEN RETURN 'transferts'; END IF;
  RETURN 'autres';
END $$;

-- ─── 4. Trigger auto-catégorisation (BEFORE INSERT) ─────────────────────────
CREATE OR REPLACE FUNCTION public.auto_categorize_demande()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.categorie_dossier IS NULL THEN
    NEW.categorie_dossier := public.map_service_to_categorie(NEW.service);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_categorize ON public.demandes;
CREATE TRIGGER trg_auto_categorize
  BEFORE INSERT ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.auto_categorize_demande();

-- ─── 5. Backfill catégories pour demandes existantes ────────────────────────
UPDATE public.demandes
SET categorie_dossier = public.map_service_to_categorie(service)
WHERE categorie_dossier IS NULL;

-- ─── 6. Refonte trigger d'assignation (priorité spécialistes) ───────────────
-- Tentative 1 : agent spécialiste (catégorie ∈ specialites) avec charge la + faible
-- Tentative 2 : fallback round-robin global sur agents actifs
CREATE OR REPLACE FUNCTION public.assign_demande_to_agent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE selected uuid; cat text;
BEGIN
  IF NEW.agent_id IS NOT NULL THEN RETURN NEW; END IF;
  cat := COALESCE(NEW.categorie_dossier,
                  public.map_service_to_categorie(NEW.service));

  -- 1. Spécialiste avec moins de dossiers actifs
  SELECT p.id INTO selected
  FROM public.profiles p
  LEFT JOIN public.demandes d ON d.agent_id = p.id
    AND d.statut IN ('nouveau','en_cours','en_traitement')
  WHERE p.role = 'agent'
    AND COALESCE(p.actif, TRUE) = TRUE
    AND cat = ANY(p.specialites)
  GROUP BY p.id
  ORDER BY COUNT(d.id) ASC, RANDOM()
  LIMIT 1;

  -- 2. Fallback global
  IF selected IS NULL THEN
    SELECT p.id INTO selected
    FROM public.profiles p
    LEFT JOIN public.demandes d ON d.agent_id = p.id
      AND d.statut IN ('nouveau','en_cours','en_traitement')
    WHERE p.role = 'agent' AND COALESCE(p.actif, TRUE) = TRUE
    GROUP BY p.id
    ORDER BY COUNT(d.id) ASC, RANDOM()
    LIMIT 1;
  END IF;

  NEW.agent_id := selected;
  RETURN NEW;
END $$;
-- (le trigger trg_assign_demande_agent de migration 031 reste branché)

-- ─── 7. Notification in-app aux agents spécialistes (AFTER INSERT) ──────────
-- Postgres ne fait pas d'HTTP : l'email Resend est envoyé par la route API
-- /api/demandes/complete (couche TS). Ce trigger ne fait QUE des notifications
-- in-app via la table notifications.
CREATE OR REPLACE FUNCTION public.notify_specialist_agents()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE agent_row record; cat text;
BEGIN
  cat := NEW.categorie_dossier;
  IF cat IS NULL THEN RETURN NEW; END IF;

  FOR agent_row IN
    SELECT id FROM public.profiles
    WHERE role = 'agent'
      AND COALESCE(actif, TRUE) = TRUE
      AND cat = ANY(specialites)
      AND id <> COALESCE(NEW.agent_id, '00000000-0000-0000-0000-000000000000'::uuid)
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      agent_row.id,
      'demande_urgent',
      'Nouveau dossier dans votre spécialité',
      'Référence ' || COALESCE(NEW.reference, 'sans réf.') || ' — ' || NEW.service,
      '/dashboard/agent/dossiers/' || cat || '/' || NEW.id
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_specialists ON public.demandes;
CREATE TRIGGER trg_notify_specialists
  AFTER INSERT ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.notify_specialist_agents();

-- ─── 8. Notes internes staff (table dédiée, append-only) ────────────────────
CREATE TABLE IF NOT EXISTS public.demande_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id),
  author_name text NOT NULL,
  author_role text NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demande_notes_demande
  ON public.demande_notes(demande_id, created_at DESC);

ALTER TABLE public.demande_notes ENABLE ROW LEVEL SECURITY;

-- RLS : admin/super_admin SEULS peuvent lire/écrire les notes (jamais le client, jamais l'agent simple)
DROP POLICY IF EXISTS "admin_super_admin_all_notes" ON public.demande_notes;
CREATE POLICY "admin_super_admin_all_notes" ON public.demande_notes
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

-- ─── 9. Permissions ─────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.map_service_to_categorie(text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.auto_categorize_demande() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.notify_specialist_agents() TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_demande_to_agent() TO service_role;
