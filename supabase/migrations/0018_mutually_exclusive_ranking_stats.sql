-- =============================================================================
-- 0018 — Rozłączne zliczanie dokładnych wyników i trafionych zwycięzców
-- Dokładny wynik (3 pkt) → exact_scores_count; tylko zwycięzca/remis (1 pkt) → correct_outcomes_count.
-- =============================================================================

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
              and pr.points_earned = 1
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
              and pr.points_earned = 1
         ), 0);
end;
$$;

select public.recalculate_all_user_total_points();
