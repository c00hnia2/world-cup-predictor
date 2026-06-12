-- =============================================================================
-- 0016 — Kryteria rozstrzygające rankingu (dokładne wyniki, trafiony zwycięzca)
-- Wymaga: 0008 (recalculate_user_total_points), 0010 (public_profiles).
-- =============================================================================

alter table public.users
  add column if not exists exact_scores_count integer not null default 0,
  add column if not exists correct_outcomes_count integer not null default 0;

create or replace view public.public_profiles
with (security_invoker = false) as
  select
    id,
    username,
    total_points,
    exact_scores_count,
    correct_outcomes_count
  from public.users;

grant select on public.public_profiles to anon, authenticated;

-- Nie-admin nie może zmieniać statystyk rankingu (jak total_points).
-- Funkcje recalculate_* ustawiają app.bypass_user_column_protection = on
-- (SECURITY DEFINER, bez sesji admina — np. migracja lub resolve_match).
create or replace function public.protect_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.bypass_user_column_protection', true) = 'on' then
    return new;
  end if;

  if not public.is_admin() then
    if new.total_points is distinct from old.total_points then
      raise exception 'Nie możesz zmieniać własnych punktów.'
        using errcode = 'check_violation';
    end if;
    if new.exact_scores_count is distinct from old.exact_scores_count then
      raise exception 'Nie możesz zmieniać własnych statystyk rankingu.'
        using errcode = 'check_violation';
    end if;
    if new.correct_outcomes_count is distinct from old.correct_outcomes_count then
      raise exception 'Nie możesz zmieniać własnych statystyk rankingu.'
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

create or replace function public.recalculate_user_total_points(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.bypass_user_column_protection', 'on', true);

  update public.users u
     set total_points = coalesce((
           select sum(pr.points_earned)
             from public.predictions pr
            where pr.user_id = p_user_id
         ), 0) + coalesce((
           select tp.points_earned
             from public.tournament_predictions tp
            where tp.user_id = p_user_id
         ), 0),
         exact_scores_count = coalesce((
           select count(*)::integer
             from public.predictions pr
            where pr.user_id = p_user_id
              and pr.points_earned = 3
         ), 0),
         correct_outcomes_count = coalesce((
           select count(*)::integer
             from public.predictions pr
            where pr.user_id = p_user_id
              and pr.points_earned >= 1
         ), 0)
   where u.id = p_user_id;
end;
$$;

create or replace function public.recalculate_all_user_total_points()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.bypass_user_column_protection', 'on', true);

  update public.users u
     set total_points = coalesce((
           select sum(pr.points_earned)
             from public.predictions pr
            where pr.user_id = u.id
         ), 0) + coalesce((
           select tp.points_earned
             from public.tournament_predictions tp
            where tp.user_id = u.id
         ), 0),
         exact_scores_count = coalesce((
           select count(*)::integer
             from public.predictions pr
            where pr.user_id = u.id
              and pr.points_earned = 3
         ), 0),
         correct_outcomes_count = coalesce((
           select count(*)::integer
             from public.predictions pr
            where pr.user_id = u.id
              and pr.points_earned >= 1
         ), 0);
end;
$$;

select public.recalculate_all_user_total_points();
