-- =============================================================================
-- 0015 — Profil public.users dopiero po potwierdzeniu emaila
-- Wcześniej trigger na INSERT do auth.users zakładał profil od razu przy signUp,
-- więc niepotwierdzone konta (np. zły adres email) trafiały do rankingu.
-- Wymaga: 0002 (handle_new_user), 0011 (unikalny username).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) handle_new_user — tworzy profil tylko dla potwierdzonego konta
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_username text;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  resolved_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(new.email, '@', 1), '')
  );

  if exists (
    select 1
    from public.users
    where lower(username) = lower(resolved_username)
      and id <> new.id
  ) then
    raise exception 'username_taken'
      using errcode = 'unique_violation';
  end if;

  insert into public.users (id, email, username, total_points, role)
  values (new.id, new.email, resolved_username, 0, 'user')
  on conflict (id) do update
    set
      email = excluded.email,
      username = coalesce(excluded.username, public.users.username);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Triggery — INSERT (natychmiastowe potwierdzenie) lub UPDATE (link w mailu)
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_email_confirmed on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.handle_new_user();

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (
    old.email_confirmed_at is null
    and new.email_confirmed_at is not null
  )
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3) Usuń profile powstałe przed tą zmianą dla niepotwierdzonych kont
-- ---------------------------------------------------------------------------
delete from public.users u
using auth.users au
where au.id = u.id
  and au.email_confirmed_at is null;

-- ---------------------------------------------------------------------------
-- 4) RPC — zajętość nicku (profil + oczekujące na potwierdzenie rejestracje)
-- ---------------------------------------------------------------------------
create or replace function public.is_username_taken(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where lower(username) = lower(trim(p_username))
  )
  or exists (
    select 1
    from auth.users au
    where au.email_confirmed_at is null
      and (
        lower(trim(coalesce(au.raw_user_meta_data->>'username', '')))
          = lower(trim(p_username))
        or lower(trim(coalesce(au.raw_user_meta_data->>'display_name', '')))
          = lower(trim(p_username))
      )
  );
$$;

grant execute on function public.is_username_taken(text) to anon, authenticated;
