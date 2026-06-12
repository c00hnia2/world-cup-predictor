import { assignCompetitionPositions } from "@/lib/competition-rank";
import {
  compareRankingStats,
  getRankingStatsFromProfile,
  toRankingCriteria,
} from "@/lib/ranking-stats";
import type { LeagueMemberWithProfile, LeagueRankEntry } from "@/types/league";
import { getUserDisplayName } from "@/types/user";

export function buildLeagueRankEntries(
  members: LeagueMemberWithProfile[],
): LeagueRankEntry[] {
  const sorted = [...members].sort((left, right) =>
    compareRankingStats(
      getRankingStatsFromProfile(left.user),
      getRankingStatsFromProfile(right.user),
    ),
  );

  const positions = assignCompetitionPositions(sorted, (member) =>
    toRankingCriteria(getRankingStatsFromProfile(member.user)),
  );

  return sorted.map((member, index) => {
    const stats = getRankingStatsFromProfile(member.user);

    return {
      position: positions[index],
      userId: member.user?.id ?? "",
      displayName: member.user
        ? getUserDisplayName(member.user)
        : "Nieznany gracz",
      totalPoints: stats.totalPoints,
      exactScoresCount: stats.exactScoresCount,
      correctOutcomesCount: stats.correctOutcomesCount,
      joinedAt: member.joined_at,
    };
  });
}
