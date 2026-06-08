import { getUserDisplayName } from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export interface MatchPredictionEntry {
  userId: string;
  displayName: string;
  predictedScoreA: number;
  predictedScoreB: number;
  pointsEarned: number | null;
  isCurrentUser: boolean;
}

export type MatchPredictionsResult =
  | { status: "ok"; predictions: MatchPredictionEntry[] }
  | { status: "unauthenticated" }
  | { status: "error" };

interface MatchPredictionRow {
  user_id: string;
  username: string | null;
  email: string | null;
  predicted_score_a: number;
  predicted_score_b: number;
  points_earned: number | null;
}

// Typy innych graczy odsłaniają się dopiero po zamknięciu typowania —
// RPC get_match_predictions egzekwuje to po stronie bazy (patrz 0006).
export async function getMatchPredictions(
  matchId: string,
): Promise<MatchPredictionsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc("get_match_predictions", {
    p_match_id: matchId,
  });

  if (error) {
    console.error("[getMatchPredictions] rpc:", error.message);
    return { status: "error" };
  }

  const predictions = ((data ?? []) as MatchPredictionRow[]).map((row) => ({
    userId: row.user_id,
    displayName: getUserDisplayName({
      username: row.username,
      email: row.email,
    }),
    predictedScoreA: row.predicted_score_a,
    predictedScoreB: row.predicted_score_b,
    pointsEarned: row.points_earned,
    isCurrentUser: row.user_id === user.id,
  }));

  // Bieżący użytkownik na górze, reszta wg nazwy (kolejność z RPC).
  predictions.sort((left, right) => {
    if (left.isCurrentUser) return -1;
    if (right.isCurrentUser) return 1;
    return left.displayName.localeCompare(right.displayName, "pl");
  });

  return { status: "ok", predictions };
}
