-- =====================================================================
-- Schema for the brand theme module (`/marca`).
--
-- Run this in the Supabase SQL editor of your project, or apply it via
-- the Supabase CLI as a migration.
--
-- It creates:
--   1. The `brand_themes` table (one row per event brand, JSON payload).
--   2. A single-active-theme constraint.
--   3. Row Level Security policies mirroring how the app uses it:
--      - Anyone can read the active theme (the studio and the wall).
--      - The server upserts with the publishable / service-role key.
--        Writes are additionally gated in the app by BRAND_ADMIN_TOKEN.
-- =====================================================================

-- 1. Table -------------------------------------------------------------
create table if not exists public.brand_themes (
  id         text primary key,
  theme      jsonb not null,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Only one active theme at a time -----------------------------------
create unique index if not exists brand_themes_single_active_idx
  on public.brand_themes (is_active)
  where is_active;

create or replace function public.set_brand_themes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_brand_themes_updated_at on public.brand_themes;
create trigger trg_brand_themes_updated_at
  before update on public.brand_themes
  for each row
  execute function public.set_brand_themes_updated_at();

-- 3. Row Level Security ------------------------------------------------
alter table public.brand_themes enable row level security;

drop policy if exists "brand_themes: public read" on public.brand_themes;
create policy "brand_themes: public read"
  on public.brand_themes
  for select
  using (true);

-- Anon write: allows the /api/brand route to upsert with the publishable
-- / anon key. If you only ever write with the service-role key, DROP
-- these two policies for stricter access.
drop policy if exists "brand_themes: anon insert" on public.brand_themes;
create policy "brand_themes: anon insert"
  on public.brand_themes
  for insert
  with check (true);

drop policy if exists "brand_themes: anon update" on public.brand_themes;
create policy "brand_themes: anon update"
  on public.brand_themes
  for update
  using (true)
  with check (true);
