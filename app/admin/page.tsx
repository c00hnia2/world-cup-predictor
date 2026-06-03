import { AdminMatchForm } from "@/components/AdminMatchForm";
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
    console.error("[admin] matches fetch error:", error.message);
    return { matches: [], hasError: true };
  }

  const matches = (data ?? []).map(normalizeMatch);
  return { matches, hasError: false };
}

export default async function AdminPage() {
  const { matches, hasError } = await getUpcomingMatches();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Panel administracyjny
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Wprowadź prawdziwy wynik i rozlicz mecz — punkty zostaną
            naliczone automatycznie.
          </p>
        </header>

        {hasError ? (
          <p className="text-rose-600 dark:text-rose-400">
            Nie udało się pobrać listy meczów.
          </p>
        ) : matches.length === 0 ? (
          <p className="rounded border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Brak meczów ze statusem „upcoming”.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Mecz
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Start
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Wynik / akcja
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const teamA = match.team_a?.name ?? "Drużyna A";
                  const teamB = match.team_b?.name ?? "Drużyna B";
                  const kickoff = new Date(match.kickoff_time).toLocaleString(
                    "pl-PL",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    },
                  );

                  return (
                    <tr
                      key={match.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {teamA} vs {teamB}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {kickoff}
                      </td>
                      <td className="px-4 py-3">
                        <AdminMatchForm
                          matchId={match.id}
                          teamAName={teamA}
                          teamBName={teamB}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
