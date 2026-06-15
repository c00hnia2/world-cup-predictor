import type { Metadata } from "next";
import { RankingTable } from "@/components/leaderboard/RankingTable";
import { assignCompetitionPositions } from "@/lib/competition-rank";
import {
  getRankingStatsFromProfile,
  toRankingCriteria,
} from "@/lib/ranking-stats";
import {
  getUserDisplayName,
  type LeaderboardEntry,
  type PublicProfile,
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
    .from("public_profiles")
    .select(
      "id, username, total_points, exact_scores_count, correct_outcomes_count",
    )
    .order("total_points", { ascending: false })
    .order("exact_scores_count", { ascending: false })
    .order("correct_outcomes_count", { ascending: false });

  if (error) {
    console.error("[leaderboard] fetch:", error.message);
    return {
      entries: [],
      currentUserId: user?.id ?? null,
      hasError: true,
      isEmpty: false,
    };
  }

  const profiles = (data ?? []) as PublicProfile[];

  if (profiles.length === 0) {
    return {
      entries: [],
      currentUserId: user?.id ?? null,
      hasError: false,
      isEmpty: true,
    };
  }

  const positions = assignCompetitionPositions(profiles, (profile) =>
    toRankingCriteria(getRankingStatsFromProfile(profile)),
  );

  const entries = profiles.map((profile, index) => ({
    ...profile,
    displayName: getUserDisplayName(profile),
    position: positions[index],
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
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <RankingTable
            rows={entries.map((entry) => ({
              key: entry.id,
              position: entry.position,
              displayName: entry.displayName,
              exactScoresCount: entry.exact_scores_count ?? 0,
              correctOutcomesCount: entry.correct_outcomes_count ?? 0,
              totalPoints: entry.total_points ?? 0,
              isCurrentUser: entry.id === currentUserId,
            }))}
          />
        </div>
      )}
    </>
  );
}
