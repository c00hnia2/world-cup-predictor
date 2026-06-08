-- =============================================================================
-- 0008 — Typowanie turniejowe (zwycięzca + król strzelców)
-- Wymaga: is_admin() (0002), protect_user_columns (0005).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.players (name) values
  ('Kylian Mbappe'),
  ('Harry Kane'),
  ('Mikel Oyarzabal'),
  ('Erling Haaland'),
  ('Lionel Messi'),
  ('Cristiano Ronaldo'),
  ('Lamine Yamal'),
  ('Vinícius Júnior'),
  ('Julian Alvarez'),
  ('Raphinha'),
  ('Kai Havertz'),
  ('Ousmane Dembélé'),
  ('Lautaro Martínez'),
  ('Neymar'),
  ('Romelu Lukaku'),
  ('Bruno Fernandes'),
  ('Ferran Torres'),
  ('Jude Bellingham'),
  ('Cody Gakpo'),
  ('Florian Wirtz'),
  ('Michael Olise'),
  ('Igor Thiago'),
  ('Memphis Depay'),
  ('Mohamed Salah'),
  ('Marcus Rashford'),
  ('Jean-Philippe Mateta'),
  ('Dani Olmo'),
  ('Donyell Malen'),
  ('Bukayo Saka'),
  ('Jamal Musiala'),
  ('Luis Diaz'),
  ('Goncalo Ramos'),
  ('Nico Williams'),
  ('Désiré Doué'),
  ('Morgan Rogers'),
  ('Viktor Gyokeres'),
  ('Nico Paz'),
  ('Kevin De Bruyne'),
  ('Leroy Sane'),
  ('Matheus Cunha'),
  ('Leandro Trossard'),
  ('Jeremy Doku'),
  ('Darwin Nunez'),
  ('Eberechi Eze'),
  ('Mikel Merino'),
  ('Nick Woltemade'),
  ('Charles De Ketelaere'),
  ('Alexander Isak'),
  ('Sadio Mane'),
  ('Christian Pulisic'),
  ('Rafael Leao'),
  ('Anthony Gordon'),
  ('Bradley Barcola'),
  ('Edin Dzeko'),
  ('Deniz Undav'),
  ('Endrick Felipe'),
  ('Alexander Sorloth'),
  ('Enner Valencia'),
  ('Raul Jimenez'),
  ('James Rodriguez'),
  ('Omar Marmoush'),
  ('Jonathan David'),
  ('Pedri'),
  ('Gabriel Martinelli'),
  ('Noa Lang'),
  ('Ricardo Pepi'),
  ('Nicolas Jackson'),
  ('Haji Wright'),
  ('Armando Gonzalez'),
  ('Folarin Balogun'),
  ('Promise David'),
  ('Antoine Semenyo'),
  ('Rayan Vitor'),
  ('Joao Felix'),
  ('Santiago Gimenez'),
  ('Ivan Toney'),
  ('Heung-Min Son'),
  ('Breel Embolo'),
  ('Ayase Ueda'),
  ('Arda Güler'),
  ('Kenan Yildiz'),
  ('Granit Xhaka'),
  ('Riyad Mahrez'),
  ('Andrej Kramaric'),
  ('Mehdi Taremi'),
  ('Ayoub El Kaabi'),
  ('Alphonso Davies'),
  ('Scott Mctominay'),
  ('Cyle Larin'),
  ('Orbelin Pineda'),
  ('Brian Rodríguez'),
  ('Daizen Maeda'),
  ('Enzo Fernandez'),
  ('Lee Kang-in'),
  ('Oscar Bobb'),
  ('Antonio Nusa'),
  ('Marko Arnautovic'),
  ('Akram Afif'),
  ('Ollie Watkins'),
  ('Dan Ndoye'),
  ('Denzel Dumfries'),
  ('Brahim Díaz'),
  ('Dodi Lukebakio'),
  ('Jorgen Strand Larsen'),
  ('Chris Wood'),
  ('Martin Ødegaard'),
  ('Hwang Hee-chan'),
  ('Ismaila Sarr'),
  ('Nikola Vlasic'),
  ('Giovanni Reyna'),
  ('Facundo Pellistri'),
  ('Hakan Calhanoglu'),
  ('Federico Valverde'),
  ('Nico O''Reilly'),
  ('Cucho Hernandez'),
  ('Salem Al-Dawsari'),
  ('Declan Rice'),
  ('Ché Adams'),
  ('Saleh Al-Shehri'),
  ('Lyndon Dykes'),
  ('Ryan Christie'),
  ('Daichi Kamada'),
  ('Julio Enciso'),
  ('Eldor Shomurodov'),
  ('John McGinn'),
  ('Brenden Aaronson'),
  ('Martin Boyle'),
  ('Lyle Foster'),
  ('Nestory Irankunda'),
  ('Ben Waine')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- tournament_predictions — jeden typ turniejowy na użytkownika
-- ---------------------------------------------------------------------------
create table if not exists public.tournament_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  predicted_winner_id uuid not null references public.teams (id),
  predicted_top_scorer_id uuid not null references public.players (id),
  points_earned integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tournament_predictions_user_unique_idx
  on public.tournament_predictions (user_id);

-- ---------------------------------------------------------------------------
-- tournament_results — singleton z faktycznymi wynikami turnieju
-- ---------------------------------------------------------------------------
create table if not exists public.tournament_results (
  id integer primary key default 1 check (id = 1),
  actual_winner_id uuid references public.teams (id),
  actual_top_scorer_id uuid references public.players (id),
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.tournament_results (id)
values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.players enable row level security;
alter table public.tournament_predictions enable row level security;
alter table public.tournament_results enable row level security;

-- players — odczyt publiczny, zapis tylko admin
drop policy if exists "Players are viewable by everyone" on public.players;
create policy "Players are viewable by everyone"
  on public.players for select using (true);

drop policy if exists "Only admins can modify players" on public.players;
create policy "Only admins can modify players"
  on public.players for all
  using (public.is_admin()) with check (public.is_admin());

-- tournament_predictions
drop policy if exists "Users can view own tournament predictions" on public.tournament_predictions;
create policy "Users can view own tournament predictions"
  on public.tournament_predictions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tournament predictions" on public.tournament_predictions;
create policy "Users can insert own tournament predictions"
  on public.tournament_predictions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tournament predictions" on public.tournament_predictions;
create policy "Users can update own tournament predictions"
  on public.tournament_predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all tournament predictions" on public.tournament_predictions;
create policy "Admins can read all tournament predictions"
  on public.tournament_predictions for select
  using (public.is_admin());

drop policy if exists "Admins can update all tournament predictions" on public.tournament_predictions;
create policy "Admins can update all tournament predictions"
  on public.tournament_predictions for update
  using (public.is_admin()) with check (public.is_admin());

-- tournament_results — odczyt dla zalogowanych, zapis tylko admin
drop policy if exists "Authenticated users can view tournament results" on public.tournament_results;
create policy "Authenticated users can view tournament results"
  on public.tournament_results for select
  using (auth.uid() is not null);

drop policy if exists "Only admins can modify tournament results" on public.tournament_results;
create policy "Only admins can modify tournament results"
  on public.tournament_results for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Trigger: blokada typów turniejowych po rozpoczęciu pierwszego meczu
-- ---------------------------------------------------------------------------
create or replace function public.protect_tournament_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if exists (
      select 1
        from public.matches
       where kickoff_time <= now()
    ) then
      raise exception 'Typowanie turniejowe jest zamknięte.'
        using errcode = 'check_violation';
    end if;

    if tg_op = 'UPDATE' then
      new.points_earned := old.points_earned;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_tournament_prediction_write on public.tournament_predictions;
create trigger protect_tournament_prediction_write
  before insert or update on public.tournament_predictions
  for each row
  execute function public.protect_tournament_prediction_write();

-- ---------------------------------------------------------------------------
-- Pomocnicza funkcja: przelicz total_points (mecze + typ turniejowy)
-- ---------------------------------------------------------------------------
create or replace function public.recalculate_user_total_points(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.users u
     set total_points = coalesce((
       select sum(pr.points_earned)
         from public.predictions pr
        where pr.user_id = p_user_id
     ), 0) + coalesce((
       select tp.points_earned
         from public.tournament_predictions tp
        where tp.user_id = p_user_id
     ), 0)
   where u.id = p_user_id;
$$;

create or replace function public.recalculate_all_user_total_points()
returns void
language sql
security definer
set search_path = public
as $$
  update public.users u
     set total_points = coalesce((
       select sum(pr.points_earned)
         from public.predictions pr
        where pr.user_id = u.id
     ), 0) + coalesce((
       select tp.points_earned
         from public.tournament_predictions tp
        where tp.user_id = u.id
     ), 0);
$$;

-- Aktualizacja resolve_match — total_points uwzględnia typ turniejowy
create or replace function public.resolve_match(
  p_match_id uuid,
  p_score_a integer,
  p_score_b integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_predictions integer;
begin
  if not public.is_admin() then
    raise exception 'Brak uprawnień.' using errcode = 'insufficient_privilege';
  end if;

  if p_score_a is null or p_score_b is null
     or p_score_a < 0 or p_score_b < 0 then
    raise exception 'Nieprawidłowy wynik (liczby całkowite >= 0).'
      using errcode = 'check_violation';
  end if;

  update public.matches
     set score_a = p_score_a,
         score_b = p_score_b,
         status  = 'finished'
   where id = p_match_id
     and status = 'upcoming';

  if not found then
    raise exception 'Nie znaleziono meczu lub został już rozliczony.'
      using errcode = 'no_data_found';
  end if;

  update public.predictions p
     set points_earned = case
       when p.predicted_score_a = p_score_a
            and p.predicted_score_b = p_score_b then 3
       when sign(p.predicted_score_a - p.predicted_score_b)
            = sign(p_score_a - p_score_b) then 1
       else 0
     end
   where p.match_id = p_match_id;

  get diagnostics affected_predictions = row_count;

  perform public.recalculate_user_total_points(u.id)
     from public.users u
    where u.id in (
      select pr.user_id from public.predictions pr where pr.match_id = p_match_id
    );

  return affected_predictions;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: rozliczenie typów turniejowych (10 pkt zwycięzca, 5 pkt król strzelców)
-- ---------------------------------------------------------------------------
create or replace function public.resolve_tournament_predictions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  tr record;
  affected_count integer;
begin
  if not public.is_admin() then
    raise exception 'Brak uprawnień.' using errcode = 'insufficient_privilege';
  end if;

  select actual_winner_id, actual_top_scorer_id
    into tr
    from public.tournament_results
   where id = 1;

  if tr.actual_winner_id is null or tr.actual_top_scorer_id is null then
    raise exception 'Ustaw faktycznego zwycięzcę i króla strzelców przed rozliczeniem.'
      using errcode = 'check_violation';
  end if;

  update public.tournament_predictions tp
     set points_earned =
       (case when tp.predicted_winner_id = tr.actual_winner_id then 10 else 0 end) +
       (case when tp.predicted_top_scorer_id = tr.actual_top_scorer_id then 5 else 0 end);

  get diagnostics affected_count = row_count;

  update public.tournament_results
     set resolved_at = now(),
         updated_at = now()
   where id = 1;

  perform public.recalculate_all_user_total_points();

  return affected_count;
end;
$$;

grant execute on function public.recalculate_user_total_points(uuid) to authenticated;
grant execute on function public.recalculate_all_user_total_points() to authenticated;
grant execute on function public.resolve_tournament_predictions() to authenticated;
