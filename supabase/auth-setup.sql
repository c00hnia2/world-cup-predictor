-- =============================================================================
-- Supabase Auth Setup (dla ISTNIEJĄCEJ tabeli public.users)
-- Uruchom tylko jeśli brakuje triggera / RLS — tabela już istnieje.
-- =============================================================================

-- Funkcja kopiująca dane z auth.users do public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_username text;
begin
  resolved_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(new.email, '@', 1), '')
  );

  insert into public.users (id, email, username, total_points)
  values (new.id, new.email, resolved_username, 0)
  on conflict (id) do update
    set
      email = excluded.email,
      username = coalesce(excluded.username, public.users.username);

  return new;
end;
$$;

-- Trigger na INSERT w auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Row Level Security (RLS)
alter table public.users enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone"
  on public.users
  for select
  using (true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Uwaga: INSERT wykonuje trigger (SECURITY DEFINER).
-- Aktualizacje total_points przez /admin mogą wymagać service role key.
