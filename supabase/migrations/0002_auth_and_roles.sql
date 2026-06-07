-- =============================================================================
-- 0002 — AUTH I ROLE
-- Trigger tworzący profil po rejestracji + funkcja is_admin().
-- =============================================================================

-- Profil zakładany automatycznie po wpisie w auth.users
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Jedno źródło prawdy o adminie (SECURITY DEFINER — bez rekursji RLS users-on-users)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- =============================================================================
-- Nadanie roli admin (wykonaj ręcznie, podmień email):
--   update public.users set role = 'admin' where email = 'twoj@email.pl';
-- =============================================================================
