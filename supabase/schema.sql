create extension if not exists "pgcrypto";

create table if not exists public.fuel_entries (
  id text primary key,
  owner_id text not null,
  date date not null,
  odometer integer not null check (odometer > 0),
  liters numeric(10, 3) not null check (liters > 0),
  total_cost numeric(10, 2) not null check (total_cost >= 0),
  price_per_liter numeric(10, 3) not null check (price_per_liter >= 0),
  station text not null default '',
  is_full_tank boolean not null default false,
  notes text not null default '',
  receipt_file_id text not null default '',
  receipt_url text not null default '',
  calendar_event_id text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fuel_entries_owner_id_idx
  on public.fuel_entries (owner_id, odometer desc);

create table if not exists public.service_entries (
  id text primary key,
  owner_id text not null,
  date date not null,
  odometer integer not null check (odometer > 0),
  total_cost numeric(10, 2) not null check (total_cost >= 0),
  service_type text not null,
  location text not null default '',
  next_service_odometer integer,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists service_entries_owner_id_idx
  on public.service_entries (owner_id, odometer desc);

create table if not exists public.expense_entries (
  id text primary key,
  owner_id text not null,
  date date not null,
  category text not null,
  total_cost numeric(10, 2) not null check (total_cost >= 0),
  odometer integer,
  vendor text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists expense_entries_owner_id_idx
  on public.expense_entries (owner_id, date desc, created_at desc);

create index if not exists expense_entries_owner_odometer_idx
  on public.expense_entries (owner_id, odometer desc);

create table if not exists public.vehicle_profiles (
  id text primary key,
  owner_id text not null unique,
  make text not null,
  model text not null,
  trim text not null default '',
  year integer,
  license_plate text not null default '',
  fuel_type text not null default '',
  transmission text not null default '',
  engine text not null default '',
  color text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into storage.buckets (id, name, public)
values ('fuel-receipts', 'fuel-receipts', false)
on conflict (id) do update set public = false;

-- Move legacy email ownership to the immutable Supabase Auth user id.
update public.fuel_entries as entry
set owner_id = auth_user.id::text
from auth.users as auth_user
where lower(entry.owner_id) = lower(auth_user.email);

update public.service_entries as entry
set owner_id = auth_user.id::text
from auth.users as auth_user
where lower(entry.owner_id) = lower(auth_user.email);

update public.expense_entries as entry
set owner_id = auth_user.id::text
from auth.users as auth_user
where lower(entry.owner_id) = lower(auth_user.email);

update public.vehicle_profiles as profile
set owner_id = auth_user.id::text
from auth.users as auth_user
where lower(profile.owner_id) = lower(auth_user.email)
  and not exists (
    select 1
    from public.vehicle_profiles as existing
    where existing.owner_id = auth_user.id::text
  );

-- Existing public links become authenticated application links.
update public.fuel_entries
set receipt_url = '/api/receipts?path=' || replace(receipt_file_id, ' ', '%20')
where receipt_file_id <> '';

alter table public.fuel_entries enable row level security;
alter table public.service_entries enable row level security;
alter table public.expense_entries enable row level security;
alter table public.vehicle_profiles enable row level security;

drop policy if exists "Users manage their fuel entries" on public.fuel_entries;
create policy "Users manage their fuel entries"
  on public.fuel_entries for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

drop policy if exists "Users manage their service entries" on public.service_entries;
create policy "Users manage their service entries"
  on public.service_entries for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

drop policy if exists "Users manage their expense entries" on public.expense_entries;
create policy "Users manage their expense entries"
  on public.expense_entries for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

drop policy if exists "Users manage their vehicle profile" on public.vehicle_profiles;
create policy "Users manage their vehicle profile"
  on public.vehicle_profiles for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

drop policy if exists "Users manage their receipt files" on storage.objects;
create policy "Users manage their receipt files"
  on storage.objects for all
  using (
    bucket_id = 'fuel-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'fuel-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
