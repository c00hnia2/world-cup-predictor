import type { PredictionMatch, UserPredictionEntry } from "@/types/prediction";
import type { Team } from "@/types/match";
import { normalizeMatch, type MatchRow } from "@/lib/normalize-match";

type TeamRelation = Team | Team[] | null;

type MatchRelation = (MatchRow & {
  score_a: number | null;
  score_b: number | null;
}) | (MatchRow & {
  score_a: number | null;
  score_b: number | null;
})[] | null;

type PredictionRow = {
  id: string;
  predicted_score_a: number;
  predicted_score_b: number;
  points_earned: number | null;
  match: MatchRelation;
};

function normalizeRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function normalizePredictionMatch(
  row: MatchRow & { score_a: number | null; score_b: number | null },
): PredictionMatch {
  const match = normalizeMatch(row);

  return {
    ...match,
    score_a: row.score_a,
    score_b: row.score_b,
  };
}

export function normalizeUserPrediction(row: PredictionRow): UserPredictionEntry {
  const matchRow = normalizeRelation(row.match);

  return {
    id: row.id,
    predicted_score_a: row.predicted_score_a,
    predicted_score_b: row.predicted_score_b,
    points_earned: row.points_earned,
    match: matchRow ? normalizePredictionMatch(matchRow) : null,
  };
}
