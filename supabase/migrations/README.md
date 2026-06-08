# Migracje Supabase

Jedno źródło prawdy dla schematu i bezpieczeństwa bazy. Uruchom pliki **po kolei**
w Supabase → SQL Editor (lub `supabase db push`, jeśli używasz CLI).

| Plik | Zawartość |
|------|-----------|
| `0001_schema.sql` | Tabele (`users`, `teams`, `matches`, `predictions`, `leagues`, `league_members`), indeksy, migracja legacy lig, usunięcie zdublowanych kolumn `code`/`owner_id`. |
| `0002_auth_and_roles.sql` | Trigger `handle_new_user` (profil po rejestracji) + funkcja `is_admin()`. |
| `0003_functions.sql` | `is_league_member()`, `find_league_id_by_invite_code()`, atomowy RPC `resolve_match()`. |
| `0004_rls_policies.sql` | Wszystkie polityki RLS (odczyt publiczny meczów/drużyn, zapis tylko admin, prywatność typów/lig). |
| `0005_protection_triggers.sql` | Triggery ochronne: blokada zmiany `total_points`/`role`, blokada locka typowania i ochrona `points_earned`. |
| `0006_match_predictions_rpc.sql` | RPC `get_match_predictions()` — historycznie ukrywało typy do 15 min przed meczem (usunięte w `0007`). |
| `0007_prediction_visibility.sql` | Jawne typy meczowe — wszyscy zalogowani widzą typy innych graczy; usunięcie RPC z `0006`. |
| `0008_tournament_predictions.sql` | Tabele `players`, `tournament_predictions`, `tournament_results`; seed zawodników; RLS; trigger locka turniejowego; RPC `resolve_tournament_predictions()`; aktualizacja `resolve_match()` o punkty turniejowe. |
| `0009_tournament_prediction_visibility.sql` | Jawne typy turniejowe — wszyscy zalogowani widzą typy turniejowe innych graczy. |

## Zasady

- Wszystkie pliki są **idempotentne** (`create ... if not exists`, `create or replace`,
  `drop policy if exists`) — można je uruchamiać wielokrotnie.
- Kolejność ma znaczenie: funkcje (`0002`, `0003`) muszą powstać przed politykami
  i triggerami, które z nich korzystają (`0004`, `0005`).
- Po wdrożeniu nadaj sobie rolę admina:
  ```sql
  update public.users set role = 'admin' where email = 'twoj@email.pl';
  ```

## Model bezpieczeństwa (skrót)

- `total_points` i `points_earned` zapisują **wyłącznie** RPC admina:
  `resolve_match` (mecze) oraz `resolve_tournament_predictions` (typ turniejowy).
- Blokada typowania meczowego (15 min przed meczem) i turniejowego (przed pierwszym
  meczem) jest egzekwowana w bazie (triggery), więc nie da się ich ominąć bezpośrednim
  wywołaniem PostgREST.
- `matches`/`teams`/`players` są publiczne do odczytu, modyfikowalne tylko przez admina.
- Typy meczowe i turniejowe są widoczne dla wszystkich zalogowanych użytkowników;
  zapis ograniczony do właściciela typu.
