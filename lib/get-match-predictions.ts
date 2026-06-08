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

interface PredictionRow {
  user_id: string;
  predicted_score_a: number;
  predicted_score_b: number;
  points_earned: number | null;
  user: { username: string | null; email: string | null } | null;
}

// Typy wszystkich graczy są widoczne cały czas (również po zamknięciu meczu) —
// nie maskujemy ani nie opóźniamy ich odsłaniania. RLS pozwala zalogowanym
// czytać wszystkie typy (patrz migracja 0004/0007).
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

  const { data, error } = await supabase
    .from("predictions")
    .select(
      "user_id, predicted_score_a, predicted_score_b, points_earned, user:users(username, email)",
    )
    .eq("match_id", matchId);

  if (error) {
    console.error("[getMatchPredictions] predictions:", error.message);
    return { status: "error" };
  }

  const predictions = ((data ?? []) as unknown as PredictionRow[]).map(
    (row) => ({
      userId: row.user_id,
      displayName: getUserDisplayName({
        username: row.user?.username ?? null,
        email: row.user?.email ?? null,
      }),
      predictedScoreA: row.predicted_score_a,
      predictedScoreB: row.predicted_score_b,
      pointsEarned: row.points_earned,
      isCurrentUser: row.user_id === user.id,
    }),
  );

  // Bieżący użytkownik na górze, reszta wg nazwy.
  predictions.sort((left, right) => {
    if (left.isCurrentUser) return -1;
    if (right.isCurrentUser) return 1;
    return left.displayName.localeCompare(right.displayName, "pl");
  });

  return { status: "ok", predictions };
}
