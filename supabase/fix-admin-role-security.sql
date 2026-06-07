-- =============================================================================
-- Zabezpieczenie roli admin — użytkownik nie może sam sobie nadać roli admin
-- Uruchom w Supabase → SQL Editor
-- =============================================================================

create or replace function public.enforce_user_profile_update_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    if not exists (
      select 1
      from public.users
      where id = auth.uid()
        and role = 'admin'
    ) then
      raise exception 'Nie możesz zmienić własnej roli.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_user_profile_update_rules on public.users;

create trigger enforce_user_profile_update_rules
  before update on public.users
  for each row
  execute function public.enforce_user_profile_update_rules();

-- Sprawdź, kto ma rolę admin (powinien być tylko Ty):
-- select id, email, username, role from public.users where role = 'admin';
