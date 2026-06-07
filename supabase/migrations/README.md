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

- `total_points` i `points_earned` zapisuje **wyłącznie** RPC `resolve_match` (admin).
- Blokada typowania (15 min przed meczem) jest egzekwowana w bazie (trigger), więc
  nie da się jej ominąć bezpośrednim wywołaniem PostgREST.
- `matches`/`teams` są publiczne do odczytu, modyfikowalne tylko przez admina.
