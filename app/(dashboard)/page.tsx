import { Suspense } from "react";
import { DashboardTabs } from "@/components/DashboardTabs";
import { MatchDaySection } from "@/components/MatchDaySection";
import { UserPredictionsSection } from "@/components/UserPredictionsSection";
import { UserPredictionsSkeleton } from "@/components/UserPredictionsSkeleton";
import { getUpcomingMatches } from "@/lib/get-upcoming-matches";
import { getUserPredictionsByMatchId } from "@/lib/get-user-predictions-by-match";
import { groupMatchesByDay } from "@/lib/group-matches-by-day";

function UpcomingMatchesContent({
  hasError,
  matchesByDay,
  showEmptyState,
  predictionsByMatchId,
}: {
  hasError: boolean;
  matchesByDay: ReturnType<typeof groupMatchesByDay>;
  showEmptyState: boolean;
  predictionsByMatchId: Record<string, { predicted_score_a: number; predicted_score_b: number }>;
}) {
  if (showEmptyState) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      >
        {hasError
          ? "Nie udało się pobrać listy meczów."
          : "Brak nadchodzących meczów"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {matchesByDay.map((day) => (
        <MatchDaySection
          key={day.sortKey}
          label={day.label}
          matches={day.matches}
          predictionsByMatchId={predictionsByMatchId}
        />
      ))}
    </div>
  );
}

export default async function Home() {
  const [{ matches, hasError }, predictionsByMatchId] = await Promise.all([
    getUpcomingMatches(),
    getUserPredictionsByMatchId(),
  ]);
  const matchesByDay = groupMatchesByDay(matches);
  const showEmptyState = hasError || matches.length === 0;

  return (
    <>
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Mistrzostwa Świata 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Dashboard typera
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Typuj nadchodzące mecze i śledź swoje zapisane prognozy w jednym miejscu.
        </p>
      </header>

      <DashboardTabs
        matchesContent={
          <UpcomingMatchesContent
            hasError={hasError}
            matchesByDay={matchesByDay}
            showEmptyState={showEmptyState}
            predictionsByMatchId={predictionsByMatchId}
          />
        }
        predictionsContent={
          <Suspense fallback={<UserPredictionsSkeleton />}>
            <UserPredictionsSection />
          </Suspense>
        }
      />
    </>
  );
}
