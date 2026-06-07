import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateLeagueForm } from "@/components/leagues/CreateLeagueForm";
import { JoinLeagueForm } from "@/components/leagues/JoinLeagueForm";
import type { LeagueSummary } from "@/types/league";
import { normalizeUserLeague } from "@/lib/normalize-league";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Prywatne ligi | Typer MŚ 2026",
  description: "Twórz prywatne ligi i rywalizuj ze znajomymi w zamkniętym gronie.",
};

async function getUserLeagues(userId: string): Promise<{
  leagues: LeagueSummary[];
  hasError: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("league_members")
    .select("league:leagues(id, name, created_at)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("[leagues] fetch:", error.message);
    return { leagues: [], hasError: true };
  }

  const leagues = (data ?? [])
    .map(normalizeUserLeague)
    .filter((league): league is LeagueSummary => league !== null);

  return { leagues, hasError: false };
}

export default async function LeaguesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/leagues");
  }

  const { leagues, hasError } = await getUserLeagues(user.id);

  return (
    <>
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Rywalizacja ze znajomymi
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Prywatne ligi
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Twórz ligi dla znajomych i rywalizujcie w zamkniętym gronie.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section
          aria-labelledby="your-leagues-heading"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <h2
            id="your-leagues-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Twoje ligi
          </h2>

          {hasError ? (
            <p
              role="alert"
              className="mt-4 text-sm text-rose-600 dark:text-rose-400"
            >
              Nie udało się pobrać listy lig.
            </p>
          ) : leagues.length === 0 ? (
            <p
              role="status"
              className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              Nie należysz jeszcze do żadnej ligi. Utwórz własną lub dołącz kodem
              zaproszenia.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {leagues.map((league) => (
                <li key={league.id}>
                  <Link
                    href={`/leagues/${league.id}`}
                    className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {league.name}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Szczegóły →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-8 sm:grid-cols-2">
          <section
            aria-labelledby="create-league-heading"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
          >
            <h2
              id="create-league-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Utwórz nową ligę
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Po utworzeniu otrzymasz unikalny kod do udostępnienia znajomym.
            </p>
            <div className="mt-5">
              <CreateLeagueForm />
            </div>
          </section>

          <section
            aria-labelledby="join-league-heading"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
          >
            <h2
              id="join-league-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Dołącz do ligi
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Wpisz 6-znakowy kod otrzymany od organizatora ligi.
            </p>
            <div className="mt-5">
              <JoinLeagueForm />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
