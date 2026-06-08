-- =============================================================================
-- 0010 — Ukrycie emaili i ról przed publicznym odczytem
-- Widok public_profiles udostępnia wyłącznie id, username, total_points.
-- Tabela users: pełny wiersz (z emailem) tylko dla właściciela i admina.
-- Wymaga: 0004 (RLS), is_admin() (0002).
-- =============================================================================

-- Widok bez emaila i roli (security_invoker = false → omija RLS na users)
create or replace view public.public_profiles
with (security_invoker = false) as
  select id, username, total_points
  from public.users;

grant select on public.public_profiles to anon, authenticated;

-- Zastąp otwartą politykę SELECT na users (using true ujawniała email i rolę)
drop policy if exists "Public profiles are viewable by everyone" on public.users;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.users;
create policy "Admins can view all profiles"
  on public.users for select
  using (public.is_admin());
