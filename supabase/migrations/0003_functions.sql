-- =============================================================================
-- 0003 — FUNKCJE POMOCNICZE I RPC
-- =============================================================================

-- Czy bieżący użytkownik jest członkiem ligi (używane w RLS lig)
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

-- Znalezienie ligi po kodzie (bez ujawniania listy lig)
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

-- ---------------------------------------------------------------------------
-- RPC: atomowe rozliczanie meczu (wynik + punkty + total_points) w 1 transakcji.
-- ---------------------------------------------------------------------------
create or replace function public.resolve_match(
  p_match_id uuid,
  p_score_a integer,
  p_score_b integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_predictions integer;
begin
  if not public.is_admin() then
    raise exception 'Brak uprawnień.' using errcode = 'insufficient_privilege';
  end if;

  if p_score_a is null or p_score_b is null
     or p_score_a < 0 or p_score_b < 0 then
    raise exception 'Nieprawidłowy wynik (liczby całkowite >= 0).'
      using errcode = 'check_violation';
  end if;

  update public.matches
     set score_a = p_score_a,
         score_b = p_score_b,
         status  = 'finished'
   where id = p_match_id
     and status = 'upcoming';

  if not found then
    raise exception 'Nie znaleziono meczu lub został już rozliczony.'
      using errcode = 'no_data_found';
  end if;

  update public.predictions p
     set points_earned = case
       when p.predicted_score_a = p_score_a
            and p.predicted_score_b = p_score_b then 3
       when sign(p.predicted_score_a - p.predicted_score_b)
            = sign(p_score_a - p_score_b) then 1
       else 0
     end
   where p.match_id = p_match_id;

  get diagnostics affected_predictions = row_count;

  -- Przelicz total_points OD ZERA (idempotentne, odporne na ponowienia)
  update public.users u
     set total_points = coalesce((
       select sum(pr.points_earned)
         from public.predictions pr
        where pr.user_id = u.id
     ), 0)
   where u.id in (
     select pr.user_id from public.predictions pr where pr.match_id = p_match_id
   );

  return affected_predictions;
end;
$$;

grant execute on function public.resolve_match(uuid, integer, integer) to authenticated;
