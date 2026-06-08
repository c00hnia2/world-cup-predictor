import type { Player } from "@/types/player";

export interface TeamOption {
  id: string;
  name: string;
}

export interface TournamentPrediction {
  id: string;
  user_id: string;
  predicted_winner_id: string;
  predicted_top_scorer_id: string;
  points_earned: number | null;
  predicted_winner?: TeamOption | null;
  predicted_top_scorer?: Player | null;
}

export interface TournamentResults {
  actual_winner_id: string | null;
  actual_top_scorer_id: string | null;
  resolved_at: string | null;
}

export interface TournamentPredictionFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export type TournamentPredictionData =
  | {
      status: "ok";
      prediction: TournamentPrediction | null;
      isLocked: boolean;
      teams: TeamOption[];
      players: Player[];
    }
  | { status: "unauthenticated" }
  | { status: "error" };
