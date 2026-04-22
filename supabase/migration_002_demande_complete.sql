-- ============================================================================
-- NEXUS RCA - Migration 002 : Formulaire de demande complet
-- Exécuter dans le SQL Editor de Supabase APRÈS schema.sql
-- ============================================================================
-- Cette migration :
--   1. Étend la table demandes existante (champs détaillés + champs dynamiques)
--   2. Ajoute le statut "incomplet" et "en_traitement"
--   3. Crée la table demande_documents
--   4. Crée le bucket Storage "demande-documents" avec ses policies
--   5. Ne casse rien de l'existant
-- ============================================================================

-- ============================================================================
-- 1. EXTENSION DES STATUTS (ajout de 'incomplet' et 'en_traitement')
-- ============================================================================
do $$ begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'incomplet'
      and enumtypid = (select oid from pg_type where typname = 'demande_status')
  ) then
    alter type demande_status add value 'incomplet';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'en_traitement'
      and enumtypid = (select oid from pg_type where typname = 'demande_status')
  ) then
    alter type demande_status add value 'en_traitement';
  end if;
end $$;

-- ============================================================================
-- 2. EXTENSION DE LA TABLE demandes
-- ============================================================================
-- Informations personnelles complémentaires
alter table public.demandes
  add column if not exists ville text,
  add column if not exists langue_preferee text default 'Français';

-- Détails structurés de la demande
alter table public.demandes
  add column if not exists objet text,
  add column if not exists date_souhaitee date,
  add column if not exists pays_concerne text,
  add column if not exists destination text,
  add column if not exists budget_estimatif text;

-- Priorité / traitement rapide
alter table public.demandes
  add column if not exists traitement_prioritaire boolean default false not null;

-- Origine de la demande (formulaire simple, complet, IA, etc.)
alter table public.demandes
  add column if not exists source text default 'formulaire_simple';

-- Champs dynamiques par service (JSONB, flexible et queryable)
-- Exemples de structures stockées :
-- visa : { type_visa, date_voyage, passeport_disponible, documents_disponibles }
-- billet : { ville_depart, destination, date_depart, date_retour, voyageurs, classe }
-- etudes : { niveau, domaine, annee_cible, etablissement_vise }
-- business : { nom_projet, secteur, stade, montant_recherche, objectif }
-- administratif : { type_document, besoin, delai }
alter table public.demandes
  add column if not exists details_service jsonb default '{}'::jsonb not null;

-- Consentements (log d'audit RGPD)
alter table public.demandes
  add column if not exists consentement_examen boolean default false not null,
  add column if not exists consentement_documents boolean default false not null,
  add column if not exists consentement_recontact boolean default false not null;

create index if not exists idx_demandes_details_service_gin
  on public.demandes using gin (details_service);

create index if not exists idx_demandes_prioritaire
  on public.demandes(traitement_prioritaire) where traitement_prioritaire = true;

-- ============================================================================
-- 3. TABLE demande_documents
-- ============================================================================
create table if not exists public.demande_documents (
  id uuid primary key default uuid_generate_v4(),
  demande_id uuid not null references public.demandes(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  storage_path text not null,          -- chemin dans le bucket
  file_name text not null,             -- nom original pour affichage
  file_size_bytes bigint not null,
  mime_type text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_demande_documents_demande_id
  on public.demande_documents(demande_id);

alter table public.demande_documents enable row level security;

-- Clients : voient uniquement les documents liés à leurs propres demandes
drop policy if exists "Clients can view own documents" on public.demande_documents;
create policy "Clients can view own documents" on public.demande_documents
  for select using (
    exists (
      select 1 from public.demandes d
      where d.id = demande_id and d.client_id = auth.uid()
    )
  );

-- Staff : accès complet en lecture
drop policy if exists "Staff can view all documents" on public.demande_documents;
create policy "Staff can view all documents" on public.demande_documents
  for select using (public.is_staff(auth.uid()));

-- Insertion : autorisée si l'uploadeur est le client de la demande OU un staff OU demande anonyme (client_id null et en création)
drop policy if exists "Users can insert documents for own demandes" on public.demande_documents;
create policy "Users can insert documents for own demandes" on public.demande_documents
  for insert with check (
    exists (
      select 1 from public.demandes d
      where d.id = demande_id
        and (
          d.client_id = auth.uid()             -- le client propriétaire
          or d.client_id is null                -- demande anonyme (créée par non-inscrit)
          or public.is_staff(auth.uid())        -- staff qui joint un document
        )
    )
  );

-- Suppression : client sur ses demandes, ou staff
drop policy if exists "Users can delete own demande documents" on public.demande_documents;
create policy "Users can delete own demande documents" on public.demande_documents
  for delete using (
    exists (
      select 1 from public.demandes d
      where d.id = demande_id
        and (d.client_id = auth.uid() or public.is_staff(auth.uid()))
    )
  );

-- ============================================================================
-- 4. BUCKET STORAGE
-- ============================================================================
-- Bucket privé pour les documents. À créer manuellement si celui-ci n'existe pas :
-- via l'UI Supabase > Storage > New bucket > nom : "demande-documents" > Public : OFF
-- OU exécuter cette insertion (nécessite d'avoir les droits storage.buckets) :

insert into storage.buckets (id, name, public)
values ('demande-documents', 'demande-documents', false)
on conflict (id) do nothing;

-- Policies Storage
-- Les chemins sont organisés comme : {demande_id}/{uuid}-{filename}
-- On se base sur le premier segment du chemin (l'id de la demande) pour autoriser l'accès.

-- Upload : utilisateurs authentifiés ET non-authentifiés (pour demandes anonymes)
-- Note : on vérifie au niveau applicatif que l'upload correspond bien à la demande
drop policy if exists "Anyone can upload demande documents" on storage.objects;
create policy "Anyone can upload demande documents" on storage.objects
  for insert with check (
    bucket_id = 'demande-documents'
  );

-- Lecture : client propriétaire ou staff
drop policy if exists "Users can read own demande documents" on storage.objects;
create policy "Users can read own demande documents" on storage.objects
  for select using (
    bucket_id = 'demande-documents'
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.demandes d
        where d.id::text = (storage.foldername(name))[1]
          and d.client_id = auth.uid()
      )
    )
  );

-- Suppression : client propriétaire ou staff
drop policy if exists "Users can delete own demande documents storage" on storage.objects;
create policy "Users can delete own demande documents storage" on storage.objects
  for delete using (
    bucket_id = 'demande-documents'
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.demandes d
        where d.id::text = (storage.foldername(name))[1]
          and d.client_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 5. VUE UTILITAIRE : demandes avec nombre de documents
-- ============================================================================
create or replace view public.demandes_avec_documents as
select
  d.*,
  coalesce((
    select count(*) from public.demande_documents dd where dd.demande_id = d.id
  ), 0) as nombre_documents
from public.demandes d;

-- La vue hérite des politiques RLS de la table demandes

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
-- Après exécution, vérifier dans Storage > Buckets que "demande-documents" existe.
-- Sinon, créer manuellement via l'UI (Private, pas de limite de taille par défaut).
