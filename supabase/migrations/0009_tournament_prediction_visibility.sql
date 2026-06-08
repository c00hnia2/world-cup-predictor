-- =============================================================================
-- 0009 — Jawne typy turniejowe innych graczy
-- Zalogowani użytkownicy mogą czytać wszystkie typy turniejowe (spójnie z
-- typami meczowymi — migracja 0007).
-- =============================================================================

drop policy if exists "Users can view own tournament predictions" on public.tournament_predictions;
drop policy if exists "Authenticated users can view all tournament predictions" on public.tournament_predictions;
create policy "Authenticated users can view all tournament predictions"
  on public.tournament_predictions for select
  using (auth.uid() is not null);
