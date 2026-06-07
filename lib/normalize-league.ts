import type { LeagueMemberWithProfile, LeagueSummary } from "@/types/league";

type UserRelation = LeagueMemberWithProfile["user"] | NonNullable<LeagueMemberWithProfile["user"]>[];

type LeagueRelation = LeagueSummary | LeagueSummary[];

type LeagueMemberRow = {
  joined_at: string;
  user: UserRelation;
};

type UserLeagueRow = {
  league: LeagueRelation;
};

function normalizeRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function normalizeLeagueMember(row: LeagueMemberRow): LeagueMemberWithProfile {
  return {
    joined_at: row.joined_at,
    user: normalizeRelation(row.user),
  };
}

export function normalizeUserLeague(row: UserLeagueRow): LeagueSummary | null {
  return normalizeRelation(row.league);
}
