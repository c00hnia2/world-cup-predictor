-- =============================================================================
-- 0006 — RPC: typy innych graczy na mecz
-- Pozwala podejrzeć typy pozostałych użytkowników, ale DOPIERO po zamknięciu
-- typowania (lock = 15 min przed meczem) — żeby nie dało się skopiować cudzych
-- typów przed meczem. Wyjątki: admin oraz mecze już rozliczone (finished).
-- Wymaga: is_admin() (0002).
-- =============================================================================

create or replace function public.get_match_predictions(p_match_id uuid)
returns table (
  user_id uuid,
  username text,
  email text,
  predicted_score_a integer,
  predicted_score_b integer,
  points_earned integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  m record;
begin
  if auth.uid() is null then
    raise exception 'Wymagane logowanie.' using errcode = 'insufficient_privilege';
  end if;

  select status, kickoff_time
    into m
    from public.matches
   where id = p_match_id;

  if not found then
    raise exception 'Nie znaleziono meczu.' using errcode = 'no_data_found';
  end if;

  -- Przed zamknięciem typowania typy są ukryte (pusty wynik).
  -- Spójne z lockiem 15 min z lib/prediction-lock.ts oraz triggerem 0005.
  if not public.is_admin()
     and m.status = 'upcoming'
     and now() < (m.kickoff_time - interval '15 minutes') then
    return;
  end if;

  return query
    select p.user_id,
           u.username,
           u.email,
           p.predicted_score_a,
           p.predicted_score_b,
           p.points_earned
      from public.predictions p
      join public.users u on u.id = p.user_id
     where p.match_id = p_match_id
     order by u.username nulls last, u.email nulls last;
end;
$$;

grant execute on function public.get_match_predictions(uuid) to authenticated;
