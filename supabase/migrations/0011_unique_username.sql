-- =============================================================================
-- 0011 — UNIKALNE NAZWY UŻYTKOWNIKÓW (case-insensitive)
-- Gwarantuje, że nie da się założyć dwóch kont o tym samym nicku
-- (niezależnie od wielkości liter). Wymaga: 0001 (users), 0002 (handle_new_user).
-- Idempotentny.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Deduplikacja istniejących nicków przed założeniem unikalnego indeksu.
--    Dla kolizji (po lower(username)) doklejamy sufiks do wszystkich poza
--    najstarszym wpisem, aby utworzenie indeksu się powiodło.
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    username,
    row_number() over (
      partition by lower(username)
      order by id
    ) as rn
  from public.users
  where username is not null
)
update public.users u
set username = u.username || '_' || r.rn
from ranked r
where u.id = r.id
  and r.rn > 1;

-- ---------------------------------------------------------------------------
-- 2) Unikalny indeks na lower(username) — twarda gwarancja na poziomie bazy,
--    odporna na wyścig (race condition) między równoległymi rejestracjami.
-- ---------------------------------------------------------------------------
create unique index if not exists users_username_lower_key
  on public.users (lower(username));

-- ---------------------------------------------------------------------------
-- 3) Trigger zakładający profil — przy kolizji nicku zgłaszamy czytelny błąd,
--    przez co cała transakcja signUp zostaje wycofana (konto nie powstaje).
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
