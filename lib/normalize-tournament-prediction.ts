import type { Player } from "@/types/player";
import type {
  TeamOption,
  TournamentPrediction,
} from "@/types/tournament_prediction";

type Relation<T> = T | T[] | null;

type TournamentPredictionRow = {
  id: string;
  user_id: string;
  predicted_winner_id: string;
  predicted_top_scorer_id: string;
  points_earned: number | null;
  predicted_winner: Relation<TeamOption>;
  predicted_top_scorer: Relation<Player>;
};

function normalizeRelation<T>(value: Relation<T>): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function normalizeTournamentPrediction(
  row: TournamentPredictionRow,
): TournamentPrediction {
  return {
    id: row.id,
    user_id: row.user_id,
    predicted_winner_id: row.predicted_winner_id,
    predicted_top_scorer_id: row.predicted_top_scorer_id,
    points_earned: row.points_earned,
    predicted_winner: normalizeRelation(row.predicted_winner),
    predicted_top_scorer: normalizeRelation(row.predicted_top_scorer),
  };
}
