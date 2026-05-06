-- ============================================================================
-- NEXUS RCA - Migration 019 : rapports mensuels (cron + table + storage)
-- À exécuter dans le SQL Editor Supabase.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Table ──────────────────────────────────────────────────────────────────
create table if not exists public.monthly_reports (
  id uuid primary key default uuid_generate_v4(),
  period_year int not null,
  period_month int not null check (period_month between 1 and 12),
  period_start timestamptz not null,
  period_end timestamptz not null,
  generated_at timestamptz default now() not null,
  generated_by uuid references public.profiles(id),  -- null si cron auto
  trigger text not null check (trigger in ('cron', 'manual')),
  status text not null check (status in ('generated', 'sent', 'failed', 'queued')),
  storage_path text,
  file_size_bytes int,
  recipients text[] not null default '{}',
  metrics jsonb not null default '{}'::jsonb,
  error_message text,
  unique (period_year, period_month)
);

create index if not exists idx_monthly_reports_period
  on public.monthly_reports(period_year desc, period_month desc);
create index if not exists idx_monthly_reports_status
  on public.monthly_reports(status);

-- ─── RLS sur la table ──────────────────────────────────────────────────────
alter table public.monthly_reports enable row level security;

-- SELECT : admin + super_admin uniquement
drop policy if exists monthly_reports_select on public.monthly_reports;
create policy monthly_reports_select on public.monthly_reports
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- INSERT/UPDATE/DELETE : aucune politique → réservé au service_role
-- (les routes API serveur écrivent via service_role).

-- ─── Storage bucket privé ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('monthly-reports', 'monthly-reports', false)
on conflict (id) do nothing;

-- ─── Storage policies ──────────────────────────────────────────────────────
-- READ : super_admin et admin uniquement (signed URLs côté serveur)
drop policy if exists monthly_reports_storage_read on storage.objects;
create policy monthly_reports_storage_read on storage.objects
  for select using (
    bucket_id = 'monthly-reports'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- INSERT/UPDATE/DELETE storage : aucune policy → service_role uniquement.
