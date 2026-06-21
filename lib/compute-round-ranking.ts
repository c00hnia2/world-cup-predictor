import { assignCompetitionPositions } from "@/lib/competition-rank";
import {
  compareRankingStats,
  getRankingStatsFromProfile,
  toRankingCriteria,
} from "@/lib/ranking-stats";

export interface RoundRankingProfile {
  id: string;
  total_points: number;
  exact_scores_count: number;
  correct_outcomes_count: number;
}

/** Liczy pozycje rankingu zgodnie z tablicą wyników (sortowanie + remisy). */
export function computeRankingValuesByUserId(
  roundProfiles: RoundRankingProfile[],
): Record<string, number> {
  const sorted = [...roundProfiles].sort((left, right) =>
    compareRankingStats(
      getRankingStatsFromProfile(left),
      getRankingStatsFromProfile(right),
    ),
  );

  const positions = assignCompetitionPositions(sorted, (profile) =>
    toRankingCriteria(getRankingStatsFromProfile(profile)),
  );

  return Object.fromEntries(
    sorted.map((profile, index) => [profile.id, positions[index]]),
  );
}
