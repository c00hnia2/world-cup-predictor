import type { Match, Team } from "@/types/match";

export interface PredictionFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface ExistingMatchPrediction {
  predicted_score_a: number;
  predicted_score_b: number;
}

export interface PredictionMatch extends Match {
  score_a: number | null;
  score_b: number | null;
}

export interface UserPredictionEntry {
  id: string;
  predicted_score_a: number;
  predicted_score_b: number;
  points_earned: number | null;
  match: PredictionMatch | null;
}

export type UserPredictionsResult =
  | { status: "ok"; predictions: UserPredictionEntry[] }
  | { status: "unauthenticated" }
  | { status: "error" };
