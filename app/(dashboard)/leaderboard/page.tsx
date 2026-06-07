import type { Metadata } from "next";
import {
  getUserDisplayName,
  type LeaderboardEntry,
  type UserProfile,
} from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Ranking | Typer MŚ 2026",
  description: "Tablica wyników — zobacz, kto prowadzi w typowaniu MŚ 2026.",
};

async function getLeaderboard(): Promise<{
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  hasError: boolean;
  isEmpty: boolean;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, total_points")
    .order("total_points", { ascending: false });

  if (error) {
    console.error("[leaderboard] fetch:", error.message);
    return {
      entries: [],
      currentUserId: user?.id ?? null,
      hasError: true,
      isEmpty: false,
    };
  }

  const profiles = (data ?? []) as UserProfile[];

  if (profiles.length === 0) {
    return {
      entries: [],
      currentUserId: user?.id ?? null,
      hasError: false,
      isEmpty: true,
    };
  }

  const entries = profiles.map((profile, index) => ({
    ...profile,
    displayName: getUserDisplayName(profile),
    position: index + 1,
  }));

  return {
    entries,
    currentUserId: user?.id ?? null,
    hasError: false,
    isEmpty: false,
  };
}

export default async function LeaderboardPage() {
  const { entries, currentUserId, hasError, isEmpty } = await getLeaderboard();

  return (
    <>
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Ranking globalny
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Tablica wyników
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Punkty za trafione typy meczów Mistrzostw Świata 2026.
        </p>
      </header>

      {hasError ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Nie udało się pobrać rankingu. Spróbuj odświeżyć stronę.
        </p>
      ) : isEmpty ? (
        <p
          role="status"
          className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
        >
          Brak graczy w rankingu.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th
                  scope="col"
                  className="w-20 px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Lp.
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Nazwa gracza
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Punkty
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isCurrentUser = entry.id === currentUserId;

                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-zinc-100 last:border-0 dark:border-zinc-800 ${
                      isCurrentUser
                        ? "bg-emerald-50 font-semibold text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-50"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    <td className="px-4 py-3 tabular-nums">{entry.position}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {entry.displayName}
                        {isCurrentUser ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-emerald-500">
                            Ty
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {entry.total_points ?? 0}
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
