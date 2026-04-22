-- ============================================================================
-- NEXUS RCA - Schema Supabase complet
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum ('super_admin', 'admin', 'agent', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demande_status as enum ('nouveau', 'en_cours', 'en_attente', 'complete', 'annule');
exception when duplicate_object then null; end $$;

do $$ begin
  create type urgence_level as enum ('faible', 'normale', 'elevee', 'critique');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- TABLE: profiles (liée à auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nom text not null,
  prenom text,
  telephone text,
  pays text default 'Centrafrique',
  role user_role not null default 'client',
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- TABLE: demandes
-- ============================================================================
create table if not exists public.demandes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete set null,
  nom_complet text not null,
  email text not null,
  telephone text not null,
  pays text not null,
  service text not null,
  description text not null,
  urgence urgence_level default 'normale' not null,
  statut demande_status default 'nouveau' not null,
  notes_internes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_demandes_client_id on public.demandes(client_id);
create index if not exists idx_demandes_agent_id on public.demandes(agent_id);
create index if not exists idx_demandes_statut on public.demandes(statut);
create index if not exists idx_demandes_created_at on public.demandes(created_at desc);

-- ============================================================================
-- TABLE: rendez_vous
-- ============================================================================
create table if not exists public.rendez_vous (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade,
  demande_id uuid references public.demandes(id) on delete set null,
  date_rdv timestamptz not null,
  duree_minutes int default 30,
  sujet text not null,
  statut text default 'planifie',
  notes text,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- TABLE: contacts (formulaire contact général)
-- ============================================================================
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  email text not null,
  telephone text,
  sujet text not null,
  message text not null,
  traite boolean default false,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- TRIGGER: mise à jour auto de updated_at
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists trg_demandes_updated_at on public.demandes;
create trigger trg_demandes_updated_at
  before update on public.demandes
  for each row execute function public.update_updated_at();

-- ============================================================================
-- TRIGGER: création automatique du profil à l'inscription
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS pour RLS
-- ============================================================================
create or replace function public.get_user_role(user_id uuid)
returns user_role as $$
  select role from public.profiles where id = user_id;
$$ language sql security definer stable;

create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('admin', 'super_admin')
  );
$$ language sql security definer stable;

create or replace function public.is_staff(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('agent', 'admin', 'super_admin')
  );
$$ language sql security definer stable;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.demandes enable row level security;
alter table public.rendez_vous enable row level security;
alter table public.contacts enable row level security;

-- ---- PROFILES policies ----
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Staff can view all profiles" on public.profiles;
create policy "Staff can view all profiles" on public.profiles
  for select using (public.is_staff(auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Super admin can update any profile" on public.profiles;
create policy "Super admin can update any profile" on public.profiles
  for update using (public.get_user_role(auth.uid()) = 'super_admin');

drop policy if exists "Super admin can delete profiles" on public.profiles;
create policy "Super admin can delete profiles" on public.profiles
  for delete using (public.get_user_role(auth.uid()) = 'super_admin');

-- ---- DEMANDES policies ----
drop policy if exists "Anyone can create demandes" on public.demandes;
create policy "Anyone can create demandes" on public.demandes
  for insert with check (true);

drop policy if exists "Clients can view own demandes" on public.demandes;
create policy "Clients can view own demandes" on public.demandes
  for select using (auth.uid() = client_id);

drop policy if exists "Staff can view all demandes" on public.demandes;
create policy "Staff can view all demandes" on public.demandes
  for select using (public.is_staff(auth.uid()));

drop policy if exists "Staff can update demandes" on public.demandes;
create policy "Staff can update demandes" on public.demandes
  for update using (public.is_staff(auth.uid()));

drop policy if exists "Admin can delete demandes" on public.demandes;
create policy "Admin can delete demandes" on public.demandes
  for delete using (public.is_admin(auth.uid()));

-- ---- RENDEZ_VOUS policies ----
drop policy if exists "Clients can view own rdv" on public.rendez_vous;
create policy "Clients can view own rdv" on public.rendez_vous
  for select using (auth.uid() = client_id);

drop policy if exists "Clients can create own rdv" on public.rendez_vous;
create policy "Clients can create own rdv" on public.rendez_vous
  for insert with check (auth.uid() = client_id);

drop policy if exists "Staff can view all rdv" on public.rendez_vous;
create policy "Staff can view all rdv" on public.rendez_vous
  for select using (public.is_staff(auth.uid()));

drop policy if exists "Staff can manage rdv" on public.rendez_vous;
create policy "Staff can manage rdv" on public.rendez_vous
  for update using (public.is_staff(auth.uid()));

-- ---- CONTACTS policies ----
drop policy if exists "Anyone can create contact" on public.contacts;
create policy "Anyone can create contact" on public.contacts
  for insert with check (true);

drop policy if exists "Staff can view contacts" on public.contacts;
create policy "Staff can view contacts" on public.contacts
  for select using (public.is_staff(auth.uid()));

drop policy if exists "Staff can update contacts" on public.contacts;
create policy "Staff can update contacts" on public.contacts
  for update using (public.is_staff(auth.uid()));

-- ============================================================================
-- INDICATIONS POUR CRÉER LE SUPER ADMIN
-- ============================================================================
-- Après inscription normale d'un utilisateur via /register, lancer cette requête
-- en remplaçant l'email pour le promouvoir super_admin :
--
-- update public.profiles set role = 'super_admin' where email = 'admin@nexus-rca.com';
-- ============================================================================
