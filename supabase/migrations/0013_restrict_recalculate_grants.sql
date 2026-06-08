-- =============================================================================
-- 0013 — OGRANICZENIE UPRAWNIEŃ DO FUNKCJI PRZELICZAJĄCYCH PUNKTY
-- recalculate_user_total_points / recalculate_all_user_total_points to funkcje
-- WEWNĘTRZNE, wołane wyłącznie z resolve_match i resolve_tournament_predictions
-- (oba SECURITY DEFINER + guard is_admin()). Nadanie ich grantu dla 'authenticated'
-- (0008) było zbędne i poszerzało powierzchnię ataku — w szczególności
-- recalculate_all_user_total_points() robi pełny UPDATE po tabeli users
-- (potencjalny wektor DoS przez spam RPC).
--
-- Wywołania wewnętrzne działają dalej: funkcje SECURITY DEFINER uruchamiają się
-- jako właściciel, który zachowuje EXECUTE niezależnie od grantu dla authenticated.
-- Wymaga: 0008.
-- =============================================================================

revoke execute on function public.recalculate_user_total_points(uuid) from authenticated;
revoke execute on function public.recalculate_all_user_total_points() from authenticated;

-- Dla pewności odbieramy też ewentualny grant dla PUBLIC (domyślny po CREATE FUNCTION).
revoke execute on function public.recalculate_user_total_points(uuid) from public;
revoke execute on function public.recalculate_all_user_total_points() from public;
