import { AdminMatchForm } from "@/components/AdminMatchForm";
import { getUpcomingMatches } from "@/lib/get-upcoming-matches";

export default async function AdminPage() {
  const { matches, hasError } = await getUpcomingMatches();

  return (
    <>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Zarządzanie
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Panel administracyjny
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Wprowadź prawdziwy wynik i rozlicz mecz — punkty zostaną naliczone
          automatycznie.
        </p>
      </header>

      {hasError ? (
        <p className="text-rose-600 dark:text-rose-400">
          Nie udało się pobrać listy meczów.
        </p>
      ) : matches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Brak meczów ze statusem „upcoming”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
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
    </>
  );
}
