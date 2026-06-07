import type { LeagueMemberWithProfile, LeagueRankEntry } from "@/types/league";
import { getUserDisplayName } from "@/types/user";

export function buildLeagueRankEntries(
  members: LeagueMemberWithProfile[],
): LeagueRankEntry[] {
  return members.map((member, index) => ({
    position: index + 1,
    userId: member.user?.id ?? "",
    displayName: member.user ? getUserDisplayName(member.user) : "Nieznany gracz",
    totalPoints: member.user?.total_points ?? 0,
    joinedAt: member.joined_at,
  }));
}
