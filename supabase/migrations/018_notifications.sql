-- ============================================================================
-- NEXUS RCA - Migration 018 : table notifications (cloche in-app)
-- À exécuter dans le SQL Editor Supabase.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Table ──────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

-- ─── Index ──────────────────────────────────────────────────────────────────
create index if not exists idx_notifications_user_created
  on public.notifications(user_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read_at)
  where read_at is null;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

-- SELECT : un user ne voit que ses notifications
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

-- UPDATE : un user ne peut marquer comme lues que ses propres notifications
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id);

-- INSERT : aucune politique permissive — l'insertion passe uniquement par
-- le service_role côté serveur (lib/notifications.ts), jamais par le client.
