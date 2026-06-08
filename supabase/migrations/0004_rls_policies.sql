-- =============================================================================
-- 0004 — POLITYKI RLS
-- Wymaga: is_admin() (0002), is_league_member() (0003).
-- =============================================================================

alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- UWAGA: ograniczenie zmiany total_points/role egzekwuje trigger w 0005
-- (RLS nie filtruje kolumn).

drop policy if exists "Admins can update all profiles" on public.users;
create policy "Admins can update all profiles"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- teams — odczyt publiczny, zapis tylko admin
-- ---------------------------------------------------------------------------
drop policy if exists "Teams are viewable by everyone" on public.teams;
create policy "Teams are viewable by everyone"
  on public.teams for select using (true);

drop policy if exists "Only admins can modify teams" on public.teams;
create policy "Only admins can modify teams"
  on public.teams for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- matches — odczyt publiczny, zapis tylko admin
-- ---------------------------------------------------------------------------
drop policy if exists "Matches are viewable by everyone" on public.matches;
create policy "Matches are viewable by everyone"
  on public.matches for select using (true);

drop policy if exists "Only admins can modify matches" on public.matches;
create policy "Only admins can modify matches"
  on public.matches for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- predictions
-- ---------------------------------------------------------------------------
-- Typy wszystkich graczy są jawne: każdy zalogowany użytkownik może czytać
-- wszystkie typy (są pokazywane bezpośrednio pod meczem). Patrz
-- lib/get-match-predictions.ts.
drop policy if exists "Users can view own predictions" on public.predictions;
drop policy if exists "Authenticated users can view all predictions" on public.predictions;
create policy "Authenticated users can view all predictions"
  on public.predictions for select using (auth.uid() is not null);

drop policy if exists "Users can insert own predictions" on public.predictions;
create policy "Users can insert own predictions"
  on public.predictions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own predictions" on public.predictions;
create policy "Users can update own predictions"
  on public.predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- UWAGA: blokada locka i ochrona points_earned w triggerze 0005.

drop policy if exists "Admins can read all predictions" on public.predictions;
create policy "Admins can read all predictions"
  on public.predictions for select using (public.is_admin());

drop policy if exists "Admins can update all predictions" on public.predictions;
create policy "Admins can update all predictions"
  on public.predictions for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- leagues
-- ---------------------------------------------------------------------------
drop policy if exists "Members can view their leagues" on public.leagues;
create policy "Members can view their leagues"
  on public.leagues for select using (public.is_league_member(id));

drop policy if exists "Creators can view their leagues" on public.leagues;
create policy "Creators can view their leagues"
  on public.leagues for select using (created_by = auth.uid());

drop policy if exists "Authenticated users can create leagues" on public.leagues;
create policy "Authenticated users can create leagues"
  on public.leagues for insert with check (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- league_members
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view own memberships" on public.league_members;
create policy "Users can view own memberships"
  on public.league_members for select using (user_id = auth.uid());

drop policy if exists "Members can view league membership" on public.league_members;
create policy "Members can view league membership"
  on public.league_members for select using (public.is_league_member(league_id));

drop policy if exists "Users can join leagues as themselves" on public.league_members;
create policy "Users can join leagues as themselves"
  on public.league_members for insert with check (auth.uid() = user_id);
