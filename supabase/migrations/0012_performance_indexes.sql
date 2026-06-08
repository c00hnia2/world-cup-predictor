-- =============================================================================
-- 0012 — INDEKSY WYDAJNOŚCIOWE (klucze obce + pola wyszukiwane)
-- Uzupełnia brakujące indeksy na kolumnach FK oraz tych używanych w filtrach/
-- JOIN-ach. Przyspiesza zapytania i kaskadowe usuwanie (ON DELETE CASCADE).
-- Idempotentny (CREATE INDEX IF NOT EXISTS). Wymaga: 0001, 0008.
-- =============================================================================

-- predictions: filtrowanie po samym match_id (lib/get-match-predictions.ts).
-- Istniejący indeks unikalny (user_id, match_id) ma user_id jako kolumnę wiodącą,
-- więc NIE obsługuje zapytań filtrujących wyłącznie po match_id.
create index if not exists predictions_match_id_idx
  on public.predictions (match_id);

-- leagues: FK created_by -> users (JOIN-y i kaskadowe usuwanie po usunięciu usera).
create index if not exists leagues_created_by_idx
  on public.leagues (created_by);

-- matches: FK do teams (JOIN team_a/team_b przy listowaniu meczów).
create index if not exists matches_team_a_id_idx
  on public.matches (team_a_id);
create index if not exists matches_team_b_id_idx
  on public.matches (team_b_id);

-- tournament_predictions: FK do teams/players (JOIN w lib/get-tournament-predictions.ts).
create index if not exists tournament_predictions_winner_idx
  on public.tournament_predictions (predicted_winner_id);
create index if not exists tournament_predictions_scorer_idx
  on public.tournament_predictions (predicted_top_scorer_id);
