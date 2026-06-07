-- =============================================================================
-- Prywatne ligi — tabele, funkcje pomocnicze i RLS
-- Uruchom CAŁY plik w: Supabase Dashboard → SQL Editor → Run
-- Działa zarówno na świeżej bazie, jak i gdy tabela leagues już istnieje.
-- =============================================================================

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6}$'),
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Migracja: starsza tabela leagues bez kolumny invite_code
-- (CREATE TABLE IF NOT EXISTS powyżej nic nie zmienia, jeśli tabela już jest)
-- ---------------------------------------------------------------------------
alter table public.leagues
  add column if not exists invite_code text;

alter table public.leagues
  add column if not exists created_by uuid references public.users (id) on delete cascade;

alter table public.leagues
  add column if not exists created_at timestamptz default now();

update public.leagues
set invite_code = upper(
  substr(
    md5(random()::text || id::text || clock_timestamp()::text),
    1,
    6
  )
)
where invite_code is null;

do $$
declare
  league_row record;
  new_code text;
  attempt integer;
begin
  for league_row in
    select id from public.leagues
    where invite_code in (
      select invite_code
      from public.leagues
      group by invite_code
      having count(*) > 1
    )
  loop
    attempt := 0;
    loop
      attempt := attempt + 1;
      new_code := upper(
        substr(md5(random()::text || league_row.id::text || attempt::text), 1, 6)
      );
      exit when not exists (
        select 1
        from public.leagues
        where invite_code = new_code
          and id <> league_row.id
      );
      exit when attempt >= 20;
    end loop;
    update public.leagues
    set invite_code = new_code
    where id = league_row.id;
  end loop;
end $$;

alter table public.leagues
  alter column invite_code set not null;

alter table public.leagues
  drop constraint if exists leagues_invite_code_check;

alter table public.leagues
  add constraint leagues_invite_code_check
  check (invite_code ~ '^[A-Z0-9]{6}$');

-- ---------------------------------------------------------------------------

create table if not exists public.league_members (
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index if not exists league_members_user_id_idx
  on public.league_members (user_id);

create unique index if not exists leagues_invite_code_idx
  on public.leagues (invite_code);

create or replace function public.is_league_member(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.league_members
    where league_id = p_league_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.find_league_id_by_invite_code(p_code text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.leagues
  where invite_code = upper(trim(p_code))
  limit 1;
$$;

grant execute on function public.is_league_member(uuid) to authenticated;
grant execute on function public.find_league_id_by_invite_code(text) to authenticated;

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

drop policy if exists "Members can view their leagues" on public.leagues;
create policy "Members can view their leagues"
  on public.leagues
  for select
  using (public.is_league_member(id));

drop policy if exists "Creators can view their leagues" on public.leagues;
create policy "Creators can view their leagues"
  on public.leagues
  for select
  using (created_by = auth.uid());

drop policy if exists "Authenticated users can create leagues" on public.leagues;
create policy "Authenticated users can create leagues"
  on public.leagues
  for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users can view own memberships" on public.league_members;
create policy "Users can view own memberships"
  on public.league_members
  for select
  using (user_id = auth.uid());

drop policy if exists "Members can view league membership" on public.league_members;
create policy "Members can view league membership"
  on public.league_members
  for select
  using (public.is_league_member(league_id));

drop policy if exists "Users can join leagues as themselves" on public.league_members;
create policy "Users can join leagues as themselves"
  on public.league_members
  for insert
  with check (auth.uid() = user_id);
