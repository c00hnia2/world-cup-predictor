import { assignCompetitionPositions } from "@/lib/competition-rank";
import type { LeagueMemberWithProfile, LeagueRankEntry } from "@/types/league";
import { getUserDisplayName } from "@/types/user";

export function buildLeagueRankEntries(
  members: LeagueMemberWithProfile[],
): LeagueRankEntry[] {
  const positions = assignCompetitionPositions(
    members,
    (member) => member.user?.total_points ?? 0,
  );

  return members.map((member, index) => ({
    position: positions[index],
    userId: member.user?.id ?? "",
    displayName: member.user ? getUserDisplayName(member.user) : "Nieznany gracz",
    totalPoints: member.user?.total_points ?? 0,
    joinedAt: member.joined_at,
  }));
}
