-- =============================================================================
-- 0007 — Jawne typy graczy
-- Znosi blokadę widoczności cudzych typów (RPC 0006 ukrywało je do 15 min przed
-- meczem). Typy wszystkich graczy są teraz widoczne cały czas, bezpośrednio pod
-- meczem (również po jego zamknięciu), więc RLS pozwala zalogowanym czytać
-- wszystkie typy, a niepotrzebne już RPC usuwamy.
-- Wymaga: 0004 (RLS), 0006 (RPC do usunięcia).
-- =============================================================================

-- Każdy zalogowany użytkownik może odczytać wszystkie typy.
drop policy if exists "Users can view own predictions" on public.predictions;
drop policy if exists "Authenticated users can view all predictions" on public.predictions;
create policy "Authenticated users can view all predictions"
  on public.predictions for select using (auth.uid() is not null);

-- RPC z czasowym ukrywaniem typów (lock 15 min) nie jest już potrzebne —
-- typy czytamy bezpośrednio z tabeli.
drop function if exists public.get_match_predictions(uuid);
