import { assignCompetitionPositions } from "@/lib/competition-rank";
import type {
  ComparisonPlayer,
  ComparisonTimelinePoint,
  TimelineComparisonDataset,
} from "@/lib/profile-chart-data";
import { computeRankingValuesByUserId } from "@/lib/compute-round-ranking";
import { calculatePoints } from "@/lib/scoring";
import { getUserDisplayName, type PublicProfile } from "@/types/user";
import { createClient } from "@/utils/supabase/server";

interface FinishedPredictionRow {
  user_id: string;
  points_earned: number | null;
  predicted_score_a: number;
  predicted_score_b: number;
  kickoff_time: string;
  score_a: number;
  score_b: number;
}

function resolveRowPoints(row: FinishedPredictionRow): number {
  return (
    row.points_earned ??
    calculatePoints(
      row.predicted_score_a,
      row.predicted_score_b,
      row.score_a,
      row.score_b,
    )
  );
}

function formatRoundLabel(isoDate: string, roundIndex: number): string {
  const formattedDate = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));

  return `${roundIndex}. kolejka (${formattedDate})`;
}

export async function buildTimelineComparisonData(
  currentUserId: string,
): Promise<TimelineComparisonDataset | null> {
  const supabase = await createClient();

  const [
    { data: profilesData, error: profilesError },
    { data: predictionsData, error: predictionsError },
    { data: tournamentData, error: tournamentError },
  ] = await Promise.all([
    supabase
      .from("public_profiles")
      .select(
        "id, username, total_points, exact_scores_count, correct_outcomes_count",
      ),
    supabase
      .from("predictions")
      .select(
        `
          user_id,
          predicted_score_a,
          predicted_score_b,
          points_earned,
          match:matches!inner(
            kickoff_time,
            status,
            score_a,
            score_b
          )
        `,
      )
      .eq("match.status", "finished")
      .not("match.score_a", "is", null)
      .not("match.score_b", "is", null),
    supabase.from("tournament_predictions").select("user_id, points_earned"),
  ]);

  if (profilesError || predictionsError || tournamentError) {
    console.error(
      "[buildTimelineComparisonData]",
      profilesError?.message ??
        predictionsError?.message ??
        tournamentError?.message,
    );
    return null;
  }

  const profiles = (profilesData ?? []) as PublicProfile[];

  if (profiles.length === 0) {
    return null;
  }

  const currentProfile = profiles.find((profile) => profile.id === currentUserId);

  if (!currentProfile) {
    return null;
  }

  const tournamentPointsByUser = new Map<string, number>();

  for (const row of tournamentData ?? []) {
    tournamentPointsByUser.set(row.user_id, row.points_earned ?? 0);
  }

  const rows: FinishedPredictionRow[] = [];

  for (const row of predictionsData ?? []) {
    const match = Array.isArray(row.match) ? row.match[0] : row.match;

    if (
      !match ||
      match.status !== "finished" ||
      match.score_a === null ||
      match.score_b === null
    ) {
      continue;
    }

    rows.push({
      user_id: row.user_id,
      points_earned: row.points_earned,
      predicted_score_a: row.predicted_score_a,
      predicted_score_b: row.predicted_score_b,
      kickoff_time: match.kickoff_time,
      score_a: match.score_a,
      score_b: match.score_b,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  rows.sort(
    (left, right) =>
      new Date(left.kickoff_time).getTime() -
      new Date(right.kickoff_time).getTime(),
  );

  const rounds = new Map<string, FinishedPredictionRow[]>();

  for (const row of rows) {
    const dayKey = row.kickoff_time.slice(0, 10);
    const roundRows = rounds.get(dayKey) ?? [];
    roundRows.push(row);
    rounds.set(dayKey, roundRows);
  }

  const cumulativePoints = new Map<string, number>();
  const cumulativeExact = new Map<string, number>();
  const cumulativeOutcomes = new Map<string, number>();
  const rankingTimeline: ComparisonTimelinePoint[] = [];
  const pointsTimeline: ComparisonTimelinePoint[] = [];
  let roundIndex = 0;

  for (const [dayKey, roundRows] of [...rounds.entries()].sort(
    ([leftDay], [rightDay]) => leftDay.localeCompare(rightDay),
  )) {
    roundIndex += 1;

    for (const row of roundRows) {
      const points = resolveRowPoints(row);
      cumulativePoints.set(
        row.user_id,
        (cumulativePoints.get(row.user_id) ?? 0) + points,
      );

      if (points === 3) {
        cumulativeExact.set(
          row.user_id,
          (cumulativeExact.get(row.user_id) ?? 0) + 1,
        );
      } else if (points === 1) {
        cumulativeOutcomes.set(
          row.user_id,
          (cumulativeOutcomes.get(row.user_id) ?? 0) + 1,
        );
      }
    }

    const roundProfiles = profiles.map((profile) => ({
      id: profile.id,
      total_points:
        (cumulativePoints.get(profile.id) ?? 0) +
        (tournamentPointsByUser.get(profile.id) ?? 0),
      exact_scores_count: cumulativeExact.get(profile.id) ?? 0,
      correct_outcomes_count: cumulativeOutcomes.get(profile.id) ?? 0,
    }));

    const rankingValues = computeRankingValuesByUserId(roundProfiles);
    const pointsValues = Object.fromEntries(
      roundProfiles.map((profile) => [profile.id, profile.total_points]),
    );

    const label = formatRoundLabel(dayKey, roundIndex);

    rankingTimeline.push({ label, values: rankingValues });
    pointsTimeline.push({ label, values: pointsValues });
  }

  const currentUser: ComparisonPlayer = {
    id: currentUserId,
    displayName: getUserDisplayName(currentProfile),
    isCurrentUser: true,
  };

  const comparePlayers: ComparisonPlayer[] = profiles
    .filter((profile) => profile.id !== currentUserId)
    .map((profile) => ({
      id: profile.id,
      displayName: getUserDisplayName(profile),
      isCurrentUser: false,
    }))
    .sort((left, right) => left.displayName.localeCompare(right.displayName, "pl"));

  return {
    currentUserId,
    currentUser,
    comparePlayers,
    rankingTimeline,
    pointsTimeline,
  };
}

/** @deprecated Użyj buildTimelineComparisonData. */
export async function buildUserRankingHistory(
  userId: string,
): Promise<Array<{ label: string; value: number }>> {
  const comparison = await buildTimelineComparisonData(userId);

  if (!comparison) {
    return [];
  }

  return comparison.rankingTimeline.map((point) => ({
    label: point.label,
    value: point.values[userId] ?? 0,
  }));
}
