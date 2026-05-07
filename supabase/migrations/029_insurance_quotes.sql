-- ============================================================================
-- NEXUS RCA — Migration 029 : insurance_quotes (devis assurance courtage)
-- À exécuter dans le SQL Editor Supabase.
-- ============================================================================

-- ─── Fonction génération référence : NX-ASS-{année}-{numéro 4 chiffres} ────
-- Reset annuel automatique, basé sur le max de l'année en cours.
create or replace function public.gen_insurance_quote_ref()
returns text
language plpgsql
security definer
as $$
declare
  current_year integer;
  next_seq integer;
begin
  current_year := extract(year from now())::integer;

  select coalesce(
    max(substring(reference from '([0-9]+)$')::integer),
    0
  ) + 1
    into next_seq
    from public.insurance_quotes
    where reference like 'NX-ASS-' || current_year || '-%';

  return 'NX-ASS-' || current_year || '-' || lpad(next_seq::text, 4, '0');
end;
$$;

-- ─── Table insurance_quotes ────────────────────────────────────────────────
create table if not exists public.insurance_quotes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,

  -- Identité client
  full_name text not null,
  email text not null,
  whatsapp text not null,
  country_residence text,

  -- Voyage / projet
  destination text not null,
  date_depart date,
  date_retour date,
  duration_days integer,

  -- Voyageurs & couverture
  num_travelers integer not null default 1 check (num_travelers between 1 and 50),
  traveler_ages jsonb default '[]'::jsonb,        -- ex: [35, 12, 8]
  coverage_types jsonb default '[]'::jsonb,       -- ex: ["schengen","sante_intl"]
  visa_certificate_required boolean default false,

  -- Détails
  urgency text not null default 'normal'
    check (urgency in ('normal', 'urgent', 'tres_urgent')),
  comments text,

  -- Estimation tarifaire calculée
  estimate_min integer,
  estimate_max integer,
  estimate_currency text default 'EUR',

  -- Workflow statut (4 phases visibles client + 2 internes)
  status text not null default 'recu'
    check (status in (
      'recu',                -- Devis reçu
      'analyse',             -- Analyse en cours
      'validation_agent',    -- Validation agent
      'devis_pret',          -- Devis prêt
      'envoye',              -- Devis envoyé au client
      'archive'              -- Archivé
    )),

  -- Liens vers user/agent
  agent_id uuid references public.profiles(id) on delete set null,

  -- Anti-spam / traçabilité
  source_ip text,
  source_url text,
  user_agent text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────
create index if not exists idx_insurance_quotes_status
  on public.insurance_quotes(status, created_at desc);
create index if not exists idx_insurance_quotes_email
  on public.insurance_quotes(email);
create index if not exists idx_insurance_quotes_urgency
  on public.insurance_quotes(urgency, created_at desc);
create index if not exists idx_insurance_quotes_agent
  on public.insurance_quotes(agent_id, created_at desc);

-- ─── Trigger : génération automatique référence si vide ────────────────────
create or replace function public.trigger_insurance_quote_ref()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := public.gen_insurance_quote_ref();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_insurance_quote_ref on public.insurance_quotes;
create trigger trg_insurance_quote_ref
  before insert on public.insurance_quotes
  for each row execute function public.trigger_insurance_quote_ref();

-- ─── Trigger : updated_at ──────────────────────────────────────────────────
drop trigger if exists trg_insurance_quotes_updated_at on public.insurance_quotes;
create trigger trg_insurance_quotes_updated_at
  before update on public.insurance_quotes
  for each row execute function public.update_updated_at();

-- ─── Row-Level Security ────────────────────────────────────────────────────
alter table public.insurance_quotes enable row level security;

-- SELECT : staff uniquement (agent + admin + super_admin) en client.
-- La page publique de confirmation utilise la service_role côté serveur.
drop policy if exists insurance_quotes_select_staff on public.insurance_quotes;
create policy insurance_quotes_select_staff on public.insurance_quotes
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('agent', 'admin', 'super_admin')
    )
  );

-- UPDATE : agent + admin + super_admin (changement statut, affectation)
drop policy if exists insurance_quotes_update_staff on public.insurance_quotes;
create policy insurance_quotes_update_staff on public.insurance_quotes
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('agent', 'admin', 'super_admin')
    )
  );

-- INSERT : aucune politique → service_role uniquement (route API serveur).
-- DELETE : aucune politique → service_role uniquement.

-- ─── Permissions sur la fonction de référence ──────────────────────────────
grant execute on function public.gen_insurance_quote_ref() to service_role;
grant execute on function public.gen_insurance_quote_ref() to authenticated;
