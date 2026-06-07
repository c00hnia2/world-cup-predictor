-- =============================================================================
-- 0001 — SCHEMAT BAZY (źródło prawdy)
-- Idempotentny (CREATE ... IF NOT EXISTS). Bezpieczny na świeżej i istniejącej bazie.
-- =============================================================================

-- users — profil powiązany 1:1 z auth.users
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text,
  total_points integer not null default 0,
  role text not null default 'user'
);

alter table public.users
  drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('user', 'admin'));

-- teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  team_a_id uuid references public.teams (id),
  team_b_id uuid references public.teams (id),
  kickoff_time timestamptz not null,
  status text not null default 'upcoming',
  score_a integer,
  score_b integer
);

-- predictions
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  predicted_score_a integer not null,
  predicted_score_b integer not null,
  points_earned integer
);

create unique index if not exists predictions_user_match_unique_idx
  on public.predictions (user_id, match_id);

-- leagues
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6}$'),
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- league_members
create table if not exists public.league_members (
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index if not exists league_members_user_id_idx
  on public.league_members (user_id);

-- ---------------------------------------------------------------------------
-- Migracja legacy: starsza tabela leagues bez invite_code/created_by/created_at
-- ---------------------------------------------------------------------------
alter table public.leagues add column if not exists invite_code text;
alter table public.leagues add column if not exists created_by uuid references public.users (id) on delete cascade;
alter table public.leagues add column if not exists created_at timestamptz default now();

update public.leagues
set invite_code = upper(substr(md5(random()::text || id::text || clock_timestamp()::text), 1, 6))
where invite_code is null;

alter table public.leagues alter column invite_code set not null;
alter table public.leagues drop constraint if exists leagues_invite_code_check;
alter table public.leagues add constraint leagues_invite_code_check check (invite_code ~ '^[A-Z0-9]{6}$');

-- ---------------------------------------------------------------------------
-- Czyszczenie zdublowanych kolumn (code = invite_code, owner_id = created_by).
-- Najpierw usuwamy WSZYSTKIE polityki zależne od tych kolumn, potem kolumny.
-- Czyste wersje polityk powstają ponownie w 0004_rls_policies.sql.
-- ---------------------------------------------------------------------------
drop policy if exists "Owners can view their leagues" on public.leagues;
drop policy if exists "Authenticated users can create leagues" on public.leagues;

alter table public.leagues drop column if exists code;
alter table public.leagues drop column if exists owner_id;
