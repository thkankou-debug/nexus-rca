-- ============================================================================
-- NEXUS RCA - Migration 020 : visa_express_requests + bucket visa-uploads
-- À exécuter dans le SQL Editor Supabase.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Table visa_express_requests ────────────────────────────────────────────
create table if not exists public.visa_express_requests (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  nom_complet text not null,
  email text not null,
  whatsapp text not null,
  pays_destination text not null,
  type_visa text not null,
  urgence text not null check (urgence in ('normal', 'urgent', 'critique')),
  notes text,
  document_paths text[] not null default '{}',
  status text not null default 'nouveau' check (status in ('nouveau', 'en_cours', 'traite', 'annule')),
  ip text,
  user_agent text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_visa_express_status
  on public.visa_express_requests(status, created_at desc);
create index if not exists idx_visa_express_urgence
  on public.visa_express_requests(urgence, created_at desc);

-- Trigger updated_at
drop trigger if exists trg_visa_express_updated_at on public.visa_express_requests;
create trigger trg_visa_express_updated_at
  before update on public.visa_express_requests
  for each row execute function public.update_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.visa_express_requests enable row level security;

-- SELECT : staff uniquement (agent + admin + super_admin)
drop policy if exists visa_express_select_staff on public.visa_express_requests;
create policy visa_express_select_staff on public.visa_express_requests
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('agent', 'admin', 'super_admin')
    )
  );

-- UPDATE : admin + super_admin (changement de statut)
drop policy if exists visa_express_update_admins on public.visa_express_requests;
create policy visa_express_update_admins on public.visa_express_requests
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- INSERT : aucune politique → service_role uniquement (route API serveur).

-- ─── Storage bucket privé pour les pièces jointes ──────────────────────────
insert into storage.buckets (id, name, public)
values ('visa-uploads', 'visa-uploads', false)
on conflict (id) do nothing;

-- READ : staff uniquement (signed URL générée côté serveur)
drop policy if exists visa_uploads_storage_read on storage.objects;
create policy visa_uploads_storage_read on storage.objects
  for select using (
    bucket_id = 'visa-uploads'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('agent', 'admin', 'super_admin')
    )
  );

-- INSERT/UPDATE/DELETE : aucune policy → service_role uniquement.
