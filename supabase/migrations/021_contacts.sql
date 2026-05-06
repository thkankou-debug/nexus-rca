-- ============================================================================
-- NEXUS RCA - Migration 021 : table contacts (formulaire public)
-- À exécuter dans le SQL Editor Supabase.
-- Idempotente : safe à rejouer même si la table existe déjà.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Table public.contacts ──────────────────────────────────────────────────
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  nom text not null,
  email text not null,
  telephone text,
  sujet text not null,
  message text not null,
  status text not null default 'nouveau'
    check (status in ('nouveau', 'lu', 'repondu', 'archive')),
  ip text,
  user_agent text,
  source text default 'site_web',
  processed_at timestamptz,
  processed_by uuid references public.profiles(id) on delete set null,
  notes_internes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Si la table préexistait sans ces colonnes, on les ajoute (idempotent).
alter table public.contacts add column if not exists reference text;
alter table public.contacts add column if not exists status text;
alter table public.contacts add column if not exists ip text;
alter table public.contacts add column if not exists user_agent text;
alter table public.contacts add column if not exists source text;
alter table public.contacts add column if not exists processed_at timestamptz;
alter table public.contacts add column if not exists processed_by uuid;
alter table public.contacts add column if not exists notes_internes text;
alter table public.contacts add column if not exists updated_at timestamptz default now();

-- Default + check sur status si la colonne préexistait sans contrainte
do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'contacts' and constraint_name = 'contacts_status_check'
  ) then
    -- Backfill toute valeur null en 'nouveau' avant d'ajouter la contrainte
    update public.contacts set status = 'nouveau' where status is null;
    alter table public.contacts
      add constraint contacts_status_check
      check (status in ('nouveau', 'lu', 'repondu', 'archive'));
  end if;
end $$;

-- Backfill reference si manquante (migrations anciennes)
update public.contacts
  set reference = 'NX-MSG-' || upper(substring(replace(id::text, '-', ''), 1, 6))
  where reference is null;

-- Indexes
create index if not exists idx_contacts_status_created
  on public.contacts(status, created_at desc);
create index if not exists idx_contacts_email
  on public.contacts(email);
create index if not exists idx_contacts_created
  on public.contacts(created_at desc);

-- Trigger updated_at (réutilise le helper public.update_updated_at déjà défini
-- par les migrations précédentes du projet)
drop trigger if exists trg_contacts_updated_at on public.contacts;
create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function public.update_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.contacts enable row level security;

-- SELECT : staff uniquement (agent + admin + super_admin)
drop policy if exists contacts_select_staff on public.contacts;
create policy contacts_select_staff on public.contacts
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('agent', 'admin', 'super_admin')
    )
  );

-- UPDATE : admin + super_admin (changement de statut, notes internes)
drop policy if exists contacts_update_admins on public.contacts;
create policy contacts_update_admins on public.contacts
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- INSERT : aucune politique → service_role uniquement (route API serveur).
-- Les anciennes politiques d'INSERT public sont retirées si elles existaient.
drop policy if exists contacts_insert_public on public.contacts;
drop policy if exists contacts_insert_anon on public.contacts;
