-- =============================================================================
-- 0005 — TRIGGERY OCHRONNE (egzekwują reguły, których RLS nie obejmuje)
-- Wymaga: is_admin() (0002).
-- =============================================================================

-- users: nie-admin nie może zmienić total_points ani role
create or replace function public.protect_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.total_points is distinct from old.total_points then
      raise exception 'Nie możesz zmieniać własnych punktów.'
        using errcode = 'check_violation';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Nie możesz zmieniać roli.'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

-- Zastępuje starszy enforce_user_profile_update_rules
drop trigger if exists enforce_user_profile_update_rules on public.users;
drop trigger if exists protect_user_columns on public.users;
create trigger protect_user_columns
  before update on public.users
  for each row
  execute function public.protect_user_columns();

-- predictions: blokada locka (15 min przed meczem) + ochrona points_earned
create or replace function public.protect_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
begin
  if not public.is_admin() then
    select status, kickoff_time
      into m
      from public.matches
     where id = new.match_id;

    if not found
       or m.status is distinct from 'upcoming'
       or now() >= (m.kickoff_time - interval '15 minutes') then
      raise exception 'Typowanie jest zamknięte dla tego meczu.'
        using errcode = 'check_violation';
    end if;

    new.points_earned := (
      select points_earned from public.predictions where id = new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists protect_prediction_write on public.predictions;
create trigger protect_prediction_write
  before insert or update on public.predictions
  for each row
  execute function public.protect_prediction_write();

-- =============================================================================
-- WERYFIKACJA (uruchom ręcznie jako zwykły user — oba powinny rzucić wyjątek):
--   update public.users set total_points = 999 where id = auth.uid();
--   update public.predictions set points_earned = 99 where user_id = auth.uid();
-- =============================================================================
