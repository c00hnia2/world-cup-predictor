-- =============================================================================
-- RLS dla typów (predictions)
-- Uruchom w Supabase → SQL Editor
-- =============================================================================

alter table public.predictions enable row level security;

create unique index if not exists predictions_user_match_unique_idx
  on public.predictions (user_id, match_id);

drop policy if exists "Users can view own predictions" on public.predictions;
create policy "Users can view own predictions"
  on public.predictions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own predictions" on public.predictions;
create policy "Users can insert own predictions"
  on public.predictions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own predictions" on public.predictions;
create policy "Users can update own predictions"
  on public.predictions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all predictions" on public.predictions;
create policy "Admins can read all predictions"
  on public.predictions
  for select
  using (
    exists (
      select 1
      from public.users
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Admins can update all predictions" on public.predictions;
create policy "Admins can update all predictions"
  on public.predictions
  for update
  using (
    exists (
      select 1
      from public.users
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (true);
