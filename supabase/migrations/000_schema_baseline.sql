-- ============================================================================
-- BASELINE — reconstitué depuis la production le 5 septembre 2026.
-- Ne jamais rejouer sur une base existante. Sert de référence de schéma
-- uniquement (Phase 0.5 du plan V3 révisé, docs/RLS_ETAT_REEL.md).
--
-- Contexte : les migrations 001 à 017 n'existent nulle part dans ce dépôt ni
-- dans son historique Git (voir docs/AUDIT_V3.md §3.2). Ce fichier reconstitue
-- fidèlement, par introspection en lecture seule de la base de production
-- (projet Supabase yyoptsxdoekbmibkwikj, "nexus-rca -new"), les 15 tables et
-- objets qui manquaient de source versionnée. Les tables déjà couvertes par
-- les migrations 018 à 032 existantes ne sont PAS reprises ici.
--
-- Limite connue : les corps des fonctions purement utilitaires
-- (auto_link_appointment_to_client, auto_link_demande_to_client,
-- auto_link_orphan_demandes_on_profile_creation, find_available_agent,
-- get_occupied_slots, notify_specialist_agents, auto_categorize_demande,
-- map_service_to_categorie, calculate_payment_status,
-- set_expense_validation_date, update_updated_at, set_updated_at,
-- update_appointment_timestamp, update_payment_link_timestamp,
-- payments_log_event, payments_check_transition, payments_set_updated_at)
-- n'ont pas été extraits individuellement dans cette passe : seuls leurs noms
-- et leur point d'attache (table + événement) sont reconstitués via les
-- définitions de trigger. Récupérer leur corps via
-- `pg_get_functiondef` avant de considérer ce fichier comme exhaustif au-delà
-- de la structure des tables et des RLS.
-- ============================================================================


-- ============================================================================
-- 1. TYPES ENUM
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'agent', 'client');
CREATE TYPE public.urgence_level AS ENUM ('faible', 'normale', 'elevee', 'critique');
CREATE TYPE public.demande_status AS ENUM ('nouveau', 'en_cours', 'en_attente', 'complete', 'annule', 'incomplet', 'en_traitement');
CREATE TYPE public.payment_method AS ENUM ('especes', 'virement', 'mobile_money', 'western_union', 'moneygram', 'carte', 'cheque', 'autre', 'stripe', 'orange_money', 'mtn_money', 'cash', 'bank_transfer');
CREATE TYPE public.payment_status AS ENUM ('non_paye', 'partiel', 'paye', 'rembourse', 'annule', 'pending', 'paid', 'failed', 'validated', 'refunded', 'voided');
CREATE TYPE public.expense_category AS ENUM ('fournitures', 'transport', 'communication', 'restauration', 'hebergement', 'materiel', 'logiciel', 'marketing', 'maintenance', 'frais_bancaires', 'salaires', 'loyer', 'electricite', 'internet', 'autre');
CREATE TYPE public.expense_status AS ENUM ('en_attente', 'valide', 'rejete');
CREATE TYPE public.client_type AS ENUM ('particulier', 'entreprise', 'institution');
CREATE TYPE public.transfert_mode AS ENUM ('western_union', 'moneygram', 'mobile_money', 'virement_bancaire', 'ria', 'wise', 'autre');
CREATE TYPE public.transfert_statut AS ENUM ('en_attente', 'valide', 'rejete', 'effectue', 'annule');
CREATE TYPE public.quick_service_type AS ENUM ('photocopie', 'impression', 'scan', 'numerisation', 'plastification', 'saisie_document', 'assistance_formulaire', 'photo_identite', 'autre');

-- NB : payment_status mélange un vocabulaire FR (non_paye/paye/rembourse/annule)
-- et un vocabulaire EN (pending/paid/failed/validated/refunded/voided) — voir
-- docs/ECARTS_SCHEMA_TYPES.md §3. À clarifier avant la Phase 6 (finance),
-- ne pas trancher unilatéralement ici.


-- ============================================================================
-- 2. SÉQUENCES (référencées par les triggers de génération de référence)
-- ============================================================================

CREATE SEQUENCE public.appointments_ref_seq;
CREATE SEQUENCE public.payment_links_ref_seq;


-- ============================================================================
-- 3. TABLES
-- ============================================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text,
  telephone text,
  pays text DEFAULT 'Centrafrique',
  role public.user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  actif boolean NOT NULL DEFAULT true,
  poste text, -- Fonction interne de l'employé (ex: Agent commercial, Responsable visa)
  notes_internes text, -- Notes internes RH visibles uniquement par les super-admins
  specialites text[] DEFAULT '{}'
);

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reference text UNIQUE,
  type public.client_type NOT NULL DEFAULT 'particulier',
  nom text NOT NULL,
  prenom text,
  raison_sociale text,
  numero_identification text,
  email text,
  telephone text,
  telephone_2 text,
  adresse text,
  ville text,
  pays text DEFAULT 'République Centrafricaine',
  profile_id uuid REFERENCES public.profiles(id),
  notes text,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);
CREATE TRIGGER trg_clients_generate_ref BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION generate_client_reference();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.demandes (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  client_id uuid REFERENCES public.profiles(id),
  agent_id uuid REFERENCES public.profiles(id),
  client_record_id uuid REFERENCES public.clients(id),
  nom_complet text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  pays text NOT NULL,
  ville text,
  langue_preferee text DEFAULT 'Français',
  service text NOT NULL,
  objet text,
  description text NOT NULL,
  urgence public.urgence_level NOT NULL DEFAULT 'normale',
  statut public.demande_status NOT NULL DEFAULT 'nouveau',
  date_souhaitee date,
  pays_concerne text,
  destination text,
  budget_estimatif text,
  traitement_prioritaire boolean NOT NULL DEFAULT false,
  source text DEFAULT 'formulaire_simple',
  details_service jsonb NOT NULL DEFAULT '{}',
  consentement_examen boolean NOT NULL DEFAULT false,
  consentement_documents boolean NOT NULL DEFAULT false,
  consentement_recontact boolean NOT NULL DEFAULT false,
  notes_internes text,
  reference text UNIQUE,
  sexe text,
  date_naissance date,
  nationalite text,
  adresse text,
  situation_matrimoniale text,
  profession text,
  employeur text,
  niveau_etudes text,
  categorie_demande text,
  type_procedure text,
  dossier_existant boolean DEFAULT false,
  numero_dossier_existant text,
  informations_complementaires text,
  current_step integer DEFAULT 1,
  current_step_label text DEFAULT 'Dossier reçu',
  categorie_dossier text CHECK (categorie_dossier IS NULL OR categorie_dossier = ANY (ARRAY['visa','etudes_bourses','billets_hotels','assurances','financement_incubateur','digitalisation','recouvrement','transferts','autres'])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_assign_demande_agent BEFORE INSERT ON public.demandes FOR EACH ROW EXECUTE FUNCTION assign_demande_to_agent();
CREATE TRIGGER trg_auto_categorize BEFORE INSERT ON public.demandes FOR EACH ROW EXECUTE FUNCTION auto_categorize_demande();
CREATE TRIGGER trg_auto_link_demande_to_client BEFORE INSERT OR UPDATE ON public.demandes FOR EACH ROW EXECUTE FUNCTION auto_link_demande_to_client();
CREATE TRIGGER trg_demande_ref BEFORE INSERT ON public.demandes FOR EACH ROW EXECUTE FUNCTION trigger_demande_ref();
CREATE TRIGGER trg_demandes_updated_at BEFORE UPDATE ON public.demandes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notify_specialists AFTER INSERT ON public.demandes FOR EACH ROW EXECUTE FUNCTION notify_specialist_agents();

CREATE TABLE public.rendez_vous (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  client_id uuid REFERENCES public.profiles(id),
  demande_id uuid REFERENCES public.demandes(id),
  date_rdv timestamptz NOT NULL,
  duree_minutes integer DEFAULT 30,
  sujet text NOT NULL,
  statut text DEFAULT 'planifie',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- 0 ligne en production au 5/09/2026 — vérifier si obsolète au profit de
-- appointments/appointment_requests avant d'investir dessus (voir écarts).

CREATE TABLE public.demande_documents (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  demande_id uuid NOT NULL REFERENCES public.demandes(id),
  uploaded_by uuid REFERENCES public.profiles(id),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  categorie text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.profiles(id),
  client_nom text NOT NULL,
  client_email text NOT NULL,
  client_telephone text,
  agent_id uuid REFERENCES public.profiles(id),
  service_type text NOT NULL CHECK (service_type = ANY (ARRAY['visa','bourse','tcf','billet','hotel','transfert','consultation_generale','autre'])),
  rdv_date date NOT NULL,
  rdv_heure text NOT NULL,
  duree_minutes integer NOT NULL DEFAULT 60,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut = ANY (ARRAY['en_attente','confirme','annule_client','annule_agent','termine','absent'])),
  notes_client text,
  notes_agent text,
  reference text UNIQUE,
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES public.profiles(id),
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id),
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_appointments_reference BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();
CREATE TRIGGER trg_appointments_timestamp BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_appointment_timestamp();
CREATE TRIGGER trg_auto_link_appointment BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION auto_link_appointment_to_client();

CREATE TABLE public.appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE, -- format RDV-YYYY-XXXXXX
  service text NOT NULL,
  appointment_object text NOT NULL,
  meeting_type text NOT NULL CHECK (meeting_type = ANY (ARRAY['whatsapp','phone','video','onsite'])),
  duration text NOT NULL DEFAULT '30 min',
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency = ANY (ARRAY['normal','prioritaire','tres_urgent'])),
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  alternative_availability text,
  timezone text DEFAULT 'Africa/Bangui (GMT+1)',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  language text DEFAULT 'Francais',
  specific_subject text NOT NULL,
  situation text NOT NULL,
  has_existing_file text CHECK (has_existing_file = ANY (ARRAY['oui','non',''])),
  file_number text,
  has_documents_ready text CHECK (has_documents_ready = ANY (ARRAY['oui','non',''])),
  consent_accuracy boolean NOT NULL DEFAULT false,
  consent_contact boolean NOT NULL DEFAULT false,
  consent_validation boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'nouveau' CHECK (status = ANY (ARRAY['nouveau','confirme','en_attente','annule','termine'])),
  admin_notes text,
  assigned_to uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.appointment_requests IS 'Demandes de rendez-vous soumises via le formulaire public /rendez-vous';
CREATE TRIGGER trg_appointment_requests_reference BEFORE INSERT ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();
CREATE TRIGGER trg_appointment_requests_updated_at BEFORE UPDATE ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reference text UNIQUE,
  client_id uuid REFERENCES public.profiles(id),
  demande_id uuid REFERENCES public.demandes(id),
  dossier_id uuid REFERENCES public.demandes(id), -- alias fonctionnel de demande_id, requis pour nouveaux paiements
  agent_id uuid REFERENCES public.profiles(id),
  client_record_id uuid REFERENCES public.clients(id),
  client_nom text NOT NULL,
  client_email text,
  client_telephone text,
  service text NOT NULL,
  description text,
  montant_total numeric NOT NULL CHECK (montant_total >= 0),
  montant_recu numeric NOT NULL DEFAULT 0 CHECK (montant_recu >= 0),
  devise text NOT NULL DEFAULT 'XAF',
  mode_paiement public.payment_method NOT NULL DEFAULT 'especes', -- legacy, voir `method`
  method public.payment_method, -- méthode unifiée, requis pour nouveaux paiements
  date_paiement timestamptz NOT NULL DEFAULT now(),
  statut public.payment_status NOT NULL DEFAULT 'non_paye', -- legacy, voir `status`
  status public.payment_status, -- statut du cycle de vie : pending → paid → validated, ou refunded/voided
  preuve_path text,
  preuve_nom text,
  notes_internes text,
  created_by uuid REFERENCES public.profiles(id),
  validated_by uuid REFERENCES public.profiles(id), -- doit différer de created_by (séparation des pouvoirs)
  validated_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  amount numeric,
  amount_xaf numeric, -- montant équivalent FCFA gelé à la création, source unique pour reporting
  currency text,
  stripe_session_id text UNIQUE,
  stripe_payment_id text UNIQUE,
  om_transaction_id text UNIQUE,
  cash_receipt_no text,
  metadata jsonb DEFAULT '{}', -- { legacy: bool, stripe_payload?, om_payload?, ... }
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- NB : coexistence statut/status, mode_paiement/method, montant_total/amount —
-- migration de nomenclature visiblement inachevée. Voir docs/ECARTS_SCHEMA_TYPES.md §3.
CREATE TRIGGER trg_payments_generate_ref BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION generate_payment_reference();
CREATE TRIGGER trg_payments_calculate_status BEFORE INSERT OR UPDATE OF montant_recu, montant_total ON public.payments FOR EACH ROW EXECUTE FUNCTION calculate_payment_status();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION payments_set_updated_at();
CREATE TRIGGER payments_transition_check BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION payments_check_transition();
CREATE TRIGGER payments_event_logger AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION payments_log_event();

CREATE TABLE public.payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.profiles(id),
  client_nom text NOT NULL,
  client_email text NOT NULL,
  client_telephone text,
  demande_id uuid REFERENCES public.demandes(id),
  appointment_id uuid REFERENCES public.appointments(id),
  payment_id uuid REFERENCES public.payments(id),
  service text NOT NULL,
  description text,
  montant numeric NOT NULL CHECK (montant > 0),
  devise text NOT NULL DEFAULT 'XAF' CHECK (devise = ANY (ARRAY['XAF','EUR','USD','CAD'])),
  methode_choisie text CHECK (methode_choisie = ANY (ARRAY['orange_money','mtn_money','express_union','virement','especes','stripe_card', NULL])),
  numero_transaction text,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut = ANY (ARRAY['en_attente','en_cours','paiement_declare','verifie','expire','annule'])),
  notes_staff text,
  notes_client text,
  created_by uuid REFERENCES public.profiles(id),
  paid_declared_at timestamptz,
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_payment_links_reference BEFORE INSERT ON public.payment_links FOR EACH ROW EXECUTE FUNCTION generate_payment_link_reference();
CREATE TRIGGER trg_payment_links_timestamp BEFORE UPDATE ON public.payment_links FOR EACH ROW EXECUTE FUNCTION update_payment_link_timestamp();

CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id),
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['created','paid','failed','validated','refunded','voided','note_updated'])),
  from_status public.payment_status,
  to_status public.payment_status,
  actor_id uuid REFERENCES public.profiles(id),
  actor_kind text NOT NULL DEFAULT 'user' CHECK (actor_kind = ANY (ARRAY['user','webhook','system'])),
  payload jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.payment_events IS 'Audit log immuable du cycle de vie de chaque paiement. Lecture admin+.';
-- Aucune policy UPDATE/DELETE définie — journal immuable, cf. blueprint §8.

CREATE TABLE public.stripe_webhook_log (
  id text PRIMARY KEY, -- = stripe event id
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.stripe_webhook_log IS 'Idempotence des webhooks Stripe (id = stripe event id, UNIQUE).';

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reference text UNIQUE,
  employee_id uuid REFERENCES public.profiles(id),
  employee_nom text NOT NULL,
  date_depense date NOT NULL,
  categorie public.expense_category NOT NULL DEFAULT 'autre',
  montant numeric NOT NULL CHECK (montant > 0),
  devise text NOT NULL DEFAULT 'XAF',
  motif text NOT NULL,
  fournisseur text,
  mode_paiement public.payment_method NOT NULL DEFAULT 'especes',
  preuve_path text,
  preuve_nom text,
  statut public.expense_status NOT NULL DEFAULT 'en_attente',
  validated_by uuid REFERENCES public.profiles(id),
  validated_at timestamptz,
  motif_rejet text,
  notes_internes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_expenses_generate_ref BEFORE INSERT ON public.expenses FOR EACH ROW EXECUTE FUNCTION generate_expense_reference();
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expenses_validation_date BEFORE UPDATE OF statut ON public.expenses FOR EACH ROW EXECUTE FUNCTION set_expense_validation_date();

CREATE TABLE public.transferts (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reference text UNIQUE,
  client_record_id uuid REFERENCES public.clients(id),
  expediteur_nom text NOT NULL,
  expediteur_telephone text,
  expediteur_piece_identite text,
  beneficiaire_nom text NOT NULL,
  beneficiaire_telephone text,
  beneficiaire_pays text NOT NULL,
  beneficiaire_ville text,
  montant_envoye numeric NOT NULL CHECK (montant_envoye > 0),
  frais_transfert numeric DEFAULT 0 CHECK (frais_transfert >= 0),
  devise text NOT NULL DEFAULT 'XAF',
  mode_transfert public.transfert_mode NOT NULL,
  numero_reference_externe text,
  statut public.transfert_statut NOT NULL DEFAULT 'en_attente',
  motif_rejet text,
  notes text,
  agent_id uuid REFERENCES public.profiles(id),
  validated_by uuid REFERENCES public.profiles(id),
  validated_at timestamptz,
  effectue_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_transferts_generate_ref BEFORE INSERT ON public.transferts FOR EACH ROW EXECUTE FUNCTION generate_transfert_reference();
CREATE TRIGGER trg_transferts_updated_at BEFORE UPDATE ON public.transferts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.quick_sales (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reference text UNIQUE,
  client_record_id uuid REFERENCES public.clients(id),
  client_nom text,
  client_email text,
  client_telephone text,
  type_service public.quick_service_type NOT NULL,
  description text,
  quantite integer NOT NULL DEFAULT 1 CHECK (quantite > 0),
  prix_unitaire numeric NOT NULL CHECK (prix_unitaire >= 0),
  montant_total numeric NOT NULL CHECK (montant_total >= 0),
  devise text NOT NULL DEFAULT 'XAF',
  mode_paiement public.payment_method NOT NULL DEFAULT 'especes',
  date_paiement timestamptz NOT NULL DEFAULT now(),
  agent_id uuid REFERENCES public.profiles(id),
  notes_internes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_quick_sales_generate_ref BEFORE INSERT ON public.quick_sales FOR EACH ROW EXECUTE FUNCTION generate_quick_sale_reference();
CREATE TRIGGER trg_quick_sales_updated_at BEFORE UPDATE ON public.quick_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.contact_demandes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['entreprise','partenariat','autre'])),
  nom_complet text NOT NULL,
  email text NOT NULL,
  telephone text,
  organisation text,
  message text NOT NULL,
  statut text NOT NULL DEFAULT 'nouveau' CHECK (statut = ANY (ARRAY['nouveau','en_cours','traite','archive'])),
  user_id uuid REFERENCES auth.users(id), -- seule table du dépôt référençant auth.users directement plutôt que public.profiles
  traite_par uuid REFERENCES auth.users(id),
  traite_at timestamptz,
  notes_admin text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.contact_demandes IS 'Demandes de contact pro (Entreprise/Partenariat) depuis /contact-pro';


-- ============================================================================
-- 4. FONCTIONS SECURITY DEFINER — rôle et helpers d'accès
-- ============================================================================
-- ATTENTION : ces 4 fonctions n'ont pas de `search_path` fixé (WARN advisor
-- Supabase "function_search_path_mutable"). Ajouter `SET search_path = public`
-- en Phase 1, ne pas le faire silencieusement ici.

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS public.user_role
 LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  select role from public.profiles where id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('admin', 'super_admin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_staff(user_id uuid)
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('agent', 'admin', 'super_admin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, nom, prenom, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'prenom',
    'client'
  );
  return new;
end;
$function$;
-- Trigger attaché sur auth.users (hors schéma public, non recréé ici) :
-- AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================================
-- 5. FONCTIONS DE GÉNÉRATION DE RÉFÉRENCE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.gen_demande_ref()
 RETURNS text
 LANGUAGE plpgsql SECURITY DEFINER
AS $function$
DECLARE
  current_year integer;
  next_seq integer;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::integer;
  SELECT COALESCE(
    MAX(SUBSTRING(reference FROM '([0-9]+)$')::integer),
    0
  ) + 1
    INTO next_seq
    FROM public.demandes
    WHERE reference LIKE 'DEM-' || current_year || '-%';
  RETURN 'DEM-' || current_year || '-' || LPAD(next_seq::text, 6, '0');
END;
$function$;
-- NB : recalcul par MAX(...) plutôt qu'une vraie séquence Postgres — sujet à
-- une race condition théorique sous forte concurrence, atténuée par la
-- contrainte UNIQUE sur demandes.reference (l'insert concurrent échoue au
-- lieu de corrompre des données). Ne pas "corriger" sans validation : changer
-- ce mécanisme change le format perçu par les clients.

CREATE OR REPLACE FUNCTION public.trigger_demande_ref()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := public.gen_demande_ref();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_appointment_reference()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference := 'RDV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                     LPAD(NEXTVAL('appointments_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_payment_link_reference()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference := 'PAY-LINK-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                     LPAD(NEXTVAL('payment_links_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Les 5 fonctions suivantes suivent toutes le même patron (suffixe aléatoire
-- md5, sans garantie mathématique d'unicité, protégé par la contrainte
-- UNIQUE sur la colonne reference de chaque table) :

CREATE OR REPLACE FUNCTION public.generate_client_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
declare
  year_prefix text; random_suffix text;
begin
  if new.reference is null or new.reference = '' then
    year_prefix := to_char(now(), 'YYYY');
    random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new.reference := 'CL-' || year_prefix || '-' || random_suffix;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_expense_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
declare
  year_prefix text; random_suffix text;
begin
  if new.reference is null or new.reference = '' then
    year_prefix := to_char(now(), 'YYYY');
    random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new.reference := 'DEP-' || year_prefix || '-' || random_suffix;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_payment_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
declare
  year_prefix text; random_suffix text;
begin
  if new.reference is null or new.reference = '' then
    year_prefix := to_char(now(), 'YYYY');
    random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new.reference := 'PAY-' || year_prefix || '-' || random_suffix;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_quick_sale_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
declare
  year_prefix text; random_suffix text;
begin
  if new.reference is null or new.reference = '' then
    year_prefix := to_char(now(), 'YYYY');
    random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new.reference := 'CR-' || year_prefix || '-' || random_suffix;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_transfert_reference()
 RETURNS trigger LANGUAGE plpgsql AS $function$
declare
  year_prefix text; random_suffix text;
begin
  if new.reference is null or new.reference = '' then
    year_prefix := to_char(now(), 'YYYY');
    random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new.reference := 'TR-' || year_prefix || '-' || random_suffix;
  end if;
  return new;
end;
$function$;


-- ============================================================================
-- 6. RLS — ACTIVATION (toutes les 15 tables ci-dessus, confirmé rls=true en prod)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demande_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_demandes ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 7. RLS — POLICIES (USING/WITH CHECK réels, extraits de pg_policies)
-- ============================================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Super admin full access on profiles" ON public.profiles FOR ALL USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');
CREATE POLICY "Super admin can update any profile" ON public.profiles FOR UPDATE USING (get_user_role(auth.uid()) = 'super_admin');
CREATE POLICY "Super admin can delete profiles" ON public.profiles FOR DELETE USING (get_user_role(auth.uid()) = 'super_admin');
-- ⚠️ À vérifier en P1 : "Users can update own profile" ne restreint pas la
-- colonne `role` — un client authentifié pourrait potentiellement s'auto-
-- promouvoir via un UPDATE ciblé sur cette colonne si aucune policy/trigger
-- ne l'empêche par ailleurs. Vérifier en conditions réelles avant P1, ne pas
-- corriger ici (lecture seule).

-- clients
CREATE POLICY "Admin can insert clients" ON public.clients FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can read clients" ON public.clients FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update clients" ON public.clients FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Agent can insert clients" ON public.clients FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Agent can read clients" ON public.clients FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Client can view own client record" ON public.clients FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Super admin full access on clients" ON public.clients FOR ALL USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- demandes
CREATE POLICY "Anyone can create demandes" ON public.demandes FOR INSERT WITH CHECK (true);
CREATE POLICY "client_read_own_demandes" ON public.demandes FOR SELECT TO authenticated USING (
  client_id = auth.uid() OR lower(trim(email)) = (SELECT lower(trim(profiles.email)) FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "Clients can view own demandes" ON public.demandes FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Staff can view all demandes" ON public.demandes FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can update demandes" ON public.demandes FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admin can delete demandes" ON public.demandes FOR DELETE USING (is_admin(auth.uid()));
CREATE POLICY "Super admin can update demandes" ON public.demandes FOR UPDATE USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');
CREATE POLICY "Super admin can delete demandes" ON public.demandes FOR DELETE USING (get_user_role(auth.uid()) = 'super_admin');

-- demande_documents
CREATE POLICY "Clients can view own documents" ON public.demande_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM demandes d WHERE d.id = demande_documents.demande_id AND d.client_id = auth.uid())
);
CREATE POLICY "client_read_own_documents" ON public.demande_documents FOR SELECT TO authenticated USING (
  demande_id IN (SELECT demandes.id FROM demandes WHERE demandes.client_id = auth.uid()
    OR lower(trim(demandes.email)) = (SELECT lower(trim(profiles.email)) FROM profiles WHERE profiles.id = auth.uid()))
);
CREATE POLICY "Staff can view all documents" ON public.demande_documents FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Users can insert documents for own demandes" ON public.demande_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM demandes d WHERE d.id = demande_documents.demande_id
    AND (d.client_id = auth.uid() OR d.client_id IS NULL OR is_staff(auth.uid())))
);
CREATE POLICY "Users can delete own demande documents" ON public.demande_documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM demandes d WHERE d.id = demande_documents.demande_id AND (d.client_id = auth.uid() OR is_staff(auth.uid())))
);

-- appointments
CREATE POLICY "Clients see own appointments" ON public.appointments FOR SELECT USING (auth.uid() = client_id OR auth.email() = client_email);
CREATE POLICY "Agents see assigned appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin','super_admin']::user_role[]))
);
CREATE POLICY "Authenticated users can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clients can cancel own appointments" ON public.appointments FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin','super_admin']::user_role[]))
);
CREATE POLICY "Only super_admin can delete appointments" ON public.appointments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

-- appointment_requests
CREATE POLICY "appointment_requests_insert_anon" ON public.appointment_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "client_read_own_appointments" ON public.appointment_requests FOR SELECT TO authenticated USING (
  lower(trim(email)) = (SELECT lower(trim(profiles.email)) FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "appointment_requests_select_staff" ON public.appointment_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['agent','admin','super_admin']::user_role[]))
);
CREATE POLICY "appointment_requests_update_staff" ON public.appointment_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin','super_admin']::user_role[]))
);
CREATE POLICY "appointment_requests_delete_super_admin" ON public.appointment_requests FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

-- payments
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = ANY (ARRAY['super_admin','admin']::user_role[]))
  OR created_by = (SELECT auth.uid())
  OR client_id = (SELECT auth.uid())
  OR EXISTS (SELECT 1 FROM demandes d WHERE d.id = payments.dossier_id AND d.agent_id = (SELECT auth.uid()))
);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (
  (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = ANY (ARRAY['super_admin','admin','agent']::user_role[]))
  AND created_by = (SELECT auth.uid())
);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE USING (
  (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = ANY (ARRAY['super_admin','admin']::user_role[]))
);
CREATE POLICY "payments_update_notes" ON public.payments FOR UPDATE USING (
  created_by = (SELECT auth.uid()) AND (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = 'agent')
);
CREATE POLICY "payments_no_delete" ON public.payments FOR DELETE USING (false);
-- Bon pattern : suppression bloquée pour tout le monde, cohérent avec la
-- règle blueprint "aucune migration/action destructive sur les paiements".

-- payment_links
CREATE POLICY "Public can read payment_links by reference" ON public.payment_links FOR SELECT USING (true);
-- ⚠️ VOIR docs/RLS_ETAT_REEL.md §0 — cette policy autorise la lecture de
-- L'INTÉGRALITÉ de la table par n'importe qui, pas seulement "par référence"
-- comme son nom le suggère. Fuite de données personnelles active. À corriger
-- en Phase 1, PAS dans ce fichier de reference (lecture seule).
CREATE POLICY "Staff can create payment_links" ON public.payment_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['agent','admin','super_admin']::user_role[]))
);
CREATE POLICY "Update payment_links" ON public.payment_links FOR UPDATE USING (
  statut = ANY (ARRAY['en_attente','en_cours','paiement_declare'])
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['agent','admin','super_admin']::user_role[]))
);
CREATE POLICY "Only super_admin can delete payment_links" ON public.payment_links FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

-- payment_events (journal immuable — aucune policy UPDATE/DELETE, par design)
CREATE POLICY "payment_events_select" ON public.payment_events FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = ANY (ARRAY['super_admin','admin']::user_role[]))
);

-- stripe_webhook_log (écriture exclusivement via service_role, aucune policy INSERT pour rôles applicatifs)
CREATE POLICY "stripe_webhook_log_select" ON public.stripe_webhook_log FOR SELECT USING (
  (SELECT auth.uid()) IN (SELECT profiles.id FROM profiles WHERE profiles.role = 'super_admin')
);

-- expenses
CREATE POLICY "Admin can insert expenses" ON public.expenses FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can read expenses" ON public.expenses FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update expenses" ON public.expenses FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Agent can view own expenses" ON public.expenses FOR SELECT USING (is_staff(auth.uid()) AND employee_id = auth.uid());
CREATE POLICY "Agent can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (is_staff(auth.uid()) AND employee_id = auth.uid());
CREATE POLICY "Agent can update own pending expenses" ON public.expenses FOR UPDATE USING (is_staff(auth.uid()) AND employee_id = auth.uid() AND statut = 'en_attente');
CREATE POLICY "Agent can delete own pending expenses" ON public.expenses FOR DELETE USING (is_staff(auth.uid()) AND employee_id = auth.uid() AND statut = 'en_attente');
CREATE POLICY "Super admin full access on expenses" ON public.expenses FOR ALL USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- transferts
CREATE POLICY "Admin can read transferts" ON public.transferts FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update transferts" ON public.transferts FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Agent can read own transferts" ON public.transferts FOR SELECT USING (get_user_role(auth.uid()) = 'agent' AND (created_by = auth.uid() OR agent_id = auth.uid()));
CREATE POLICY "Agent can insert transferts" ON public.transferts FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'agent' AND created_by = auth.uid());
CREATE POLICY "Super admin full access on transferts" ON public.transferts FOR ALL USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- quick_sales
CREATE POLICY "Admin can insert quick_sales" ON public.quick_sales FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can read quick_sales" ON public.quick_sales FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update quick_sales" ON public.quick_sales FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Agent can read own quick_sales" ON public.quick_sales FOR SELECT USING (get_user_role(auth.uid()) = 'agent' AND (created_by = auth.uid() OR agent_id = auth.uid()));
CREATE POLICY "Agent can insert own quick_sales" ON public.quick_sales FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'agent' AND created_by = auth.uid());
CREATE POLICY "Super admin full access on quick_sales" ON public.quick_sales FOR ALL USING (get_user_role(auth.uid()) = 'super_admin') WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- contact_demandes
CREATE POLICY "contact_demandes_insert_public" ON public.contact_demandes FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_demandes_select_admin" ON public.contact_demandes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['agent','admin','super_admin']::user_role[]))
);
CREATE POLICY "contact_demandes_update_admin" ON public.contact_demandes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['agent','admin','super_admin']::user_role[]))
);

-- rendez_vous (0 ligne en prod — policies reconstituées pour mémoire, table à statut à clarifier)
CREATE POLICY "Clients can view own rdv" ON public.rendez_vous FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create own rdv" ON public.rendez_vous FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Staff can view all rdv" ON public.rendez_vous FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can manage rdv" ON public.rendez_vous FOR UPDATE USING (is_staff(auth.uid()));

-- ============================================================================
-- FIN DE LA BASELINE — ne jamais exécuter sur une base existante.
-- ============================================================================
