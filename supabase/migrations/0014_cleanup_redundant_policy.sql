-- =============================================================================
-- 0014 — PORZĄDKI: usunięcie redundantnej polityki RLS
-- Polityka "Admins can read all tournament predictions" (0008) jest nadmiarowa
-- po migracji 0009, która nadała SELECT na tournament_predictions WSZYSTKIM
-- zalogowanym użytkownikom (admin to też zalogowany użytkownik). Usuwamy ją,
-- by polityki odzwierciedlały rzeczywistą, finalną regułę widoczności.
-- Wymaga: 0009.
-- =============================================================================

drop policy if exists "Admins can read all tournament predictions"
  on public.tournament_predictions;
