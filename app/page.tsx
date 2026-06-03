import { MatchDaySection } from "@/components/MatchDaySection";
import { groupMatchesByDay } from "@/lib/group-matches-by-day";
import { normalizeMatch } from "@/lib/normalize-match";
import { createClient } from "@/utils/supabase/server";
import type { Match } from "@/types/match";

async function getUpcomingMatches(): Promise<{
  matches: Match[];
  hasError: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, kickoff_time, status, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)",
    )
    .eq("status", "upcoming")
    .order("kickoff_time", { ascending: true });

  if (error) {
    console.error("[matches] fetch error:", error.message);
    return { matches: [], hasError: true };
  }

  const matches = (data ?? []).map(normalizeMatch);
  return { matches, hasError: false };
}

export default async function Home() {
  const { matches, hasError } = await getUpcomingMatches();
  const matchesByDay = groupMatchesByDay(matches);
  const showEmptyState = hasError || matches.length === 0;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Mistrzostwa Świata 2026
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Typer MŚ 2026
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Nadchodzące mecze — typuj wyniki i zdobywaj punkty.
          </p>
        </header>

        {showEmptyState ? (
          <p
            role="status"
            className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          >
            Brak nadchodzących meczów
          </p>
        ) : (
          <div className="flex flex-col gap-14 sm:gap-16">
            {matchesByDay.map((day) => (
              <MatchDaySection
                key={day.sortKey}
                label={day.label}
                matches={day.matches}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
