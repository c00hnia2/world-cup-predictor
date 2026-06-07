-- =============================================================================
-- Naprawa RLS i polityk dla lig (uruchom w Supabase → SQL Editor)
-- =============================================================================

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
     or code = upper(trim(p_code))
  limit 1;
$$;

grant execute on function public.is_league_member(uuid) to authenticated;
grant execute on function public.find_league_id_by_invite_code(text) to authenticated;

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

drop policy if exists "Members can view their leagues" on public.leagues;
create policy "Members can view their leagues"
  on public.leagues for select
  using (public.is_league_member(id));

drop policy if exists "Creators can view their leagues" on public.leagues;
create policy "Creators can view their leagues"
  on public.leagues for select
  using (created_by = auth.uid());

drop policy if exists "Owners can view their leagues" on public.leagues;
create policy "Owners can view their leagues"
  on public.leagues for select
  using (owner_id = auth.uid());

drop policy if exists "Authenticated users can create leagues" on public.leagues;
create policy "Authenticated users can create leagues"
  on public.leagues for insert
  with check (
    auth.uid() = created_by
    or auth.uid() = owner_id
  );

drop policy if exists "Users can view own memberships" on public.league_members;
create policy "Users can view own memberships"
  on public.league_members for select
  using (user_id = auth.uid());

drop policy if exists "Members can view league membership" on public.league_members;
create policy "Members can view league membership"
  on public.league_members for select
  using (public.is_league_member(league_id));

drop policy if exists "Users can join leagues as themselves" on public.league_members;
create policy "Users can join leagues as themselves"
  on public.league_members for insert
  with check (auth.uid() = user_id);

-- Weryfikacja (powinno zwrócić polityki INSERT/SELECT):
-- select policyname, cmd from pg_policies where tablename in ('leagues', 'league_members');
