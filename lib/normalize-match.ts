import type { Match, Team } from "@/types/match";

type TeamRelation = Team | Team[] | null;

export type MatchRow = {
  id: string;
  kickoff_time: string;
  status: string;
  score_a?: number | null;
  score_b?: number | null;
  team_a: TeamRelation;
  team_b: TeamRelation;
};

function normalizeTeam(team: TeamRelation): Team | null {
  if (!team) return null;
  if (Array.isArray(team)) return team[0] ?? null;
  return team;
}

export function normalizeMatch(row: MatchRow): Match {
  return {
    id: row.id,
    kickoff_time: row.kickoff_time,
    status: row.status,
    score_a: row.score_a ?? null,
    score_b: row.score_b ?? null,
    team_a: normalizeTeam(row.team_a),
    team_b: normalizeTeam(row.team_b),
  };
}
