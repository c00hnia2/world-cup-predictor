import type { PublicProfile } from "@/types/user";

/** Rozłączne zliczanie statystyk rankingu (zgodne z recalculate_user_total_points). */
export function getPredictionRankingBuckets(pointsEarned: number): {
  exactScore: boolean;
  correctOutcome: boolean;
} {
  if (pointsEarned === 3) {
    return { exactScore: true, correctOutcome: false };
  }

  if (pointsEarned === 1) {
    return { exactScore: false, correctOutcome: true };
  }

  return { exactScore: false, correctOutcome: false };
}

export interface RankingStats {
  totalPoints: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
}

export function getRankingStatsFromProfile(
  profile:
    | Pick<
        PublicProfile,
        "total_points" | "exact_scores_count" | "correct_outcomes_count"
      >
    | null
    | undefined,
): RankingStats {
  return {
    totalPoints: profile?.total_points ?? 0,
    exactScoresCount: profile?.exact_scores_count ?? 0,
    correctOutcomesCount: profile?.correct_outcomes_count ?? 0,
  };
}

export function compareRankingStats(
  left: RankingStats,
  right: RankingStats,
): number {
  return (
    right.totalPoints - left.totalPoints ||
    right.exactScoresCount - left.exactScoresCount ||
    right.correctOutcomesCount - left.correctOutcomesCount
  );
}

export function toRankingCriteria(
  stats: RankingStats,
): readonly [number, number, number] {
  return [
    stats.totalPoints,
    stats.exactScoresCount,
    stats.correctOutcomesCount,
  ];
}
