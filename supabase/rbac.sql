-- =============================================================================
-- RBAC: rola admin + polityki RLS
-- Uruchom w: Supabase Dashboard → SQL Editor
-- =============================================================================

-- 1. Kolumna role (domyślnie 'user')
alter table public.users
  add column if not exists role text not null default 'user';

alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('user', 'admin'));

-- 2. Trigger: nowi użytkownicy dostają rolę 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_username text;
begin
  resolved_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(new.email, '@', 1), '')
  );

  insert into public.users (id, email, username, total_points, role)
  values (new.id, new.email, resolved_username, 0, 'user')
  on conflict (id) do update
    set
      email = excluded.email,
      username = coalesce(excluded.username, public.users.username);

  return new;
end;
$$;

-- 3. RLS — odczyt własnego profilu (w tym roli)
alter table public.users enable row level security;

drop policy if exists "Users can read own profile including role" on public.users;
create policy "Users can read own profile including role"
  on public.users
  for select
  using (auth.uid() = id);

-- Publiczny odczyt profili (ranking itp.) — opcjonalnie, jeśli już masz leaderboard
drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone"
  on public.users
  for select
  using (true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin może aktualizować profile (np. naliczanie total_points po meczu)
drop policy if exists "Admins can update all profiles" on public.users;
create policy "Admins can update all profiles"
  on public.users
  for update
  using (
    exists (
      select 1
      from public.users admin_user
      where admin_user.id = auth.uid()
        and admin_user.role = 'admin'
    )
  )
  with check (true);

-- =============================================================================
-- 4. PRZYKŁAD: nadanie roli admin swojemu kontu
-- Podmień email na swój adres z rejestracji.
-- =============================================================================

-- update public.users
-- set role = 'admin'
-- where email = 'twoj@email.pl';

-- Alternatywnie po id użytkownika z auth.users:
-- update public.users
-- set role = 'admin'
-- where id = 'TWOJE-UUID-Z-AUTH-USERS';
