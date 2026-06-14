import { fetchPublicProfilesByIds } from "@/lib/fetch-public-profiles";
import {
  compareRankingStats,
  getRankingStatsFromProfile,
} from "@/lib/ranking-stats";
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
    .select("user_id, predicted_score_a, predicted_score_b, points_earned")
    .eq("match_id", matchId);

  if (error) {
    console.error("[getMatchPredictions] predictions:", error.message);
    return { status: "error" };
  }

  const rows = (data ?? []) as PredictionRow[];
  const profiles = await fetchPublicProfilesByIds(
    supabase,
    rows.map((row) => row.user_id),
  );

  const predictions = rows.map((row) => {
    const profile = profiles.get(row.user_id);

    return {
      userId: row.user_id,
      displayName: getUserDisplayName({
        username: profile?.username ?? null,
      }),
      predictedScoreA: row.predicted_score_a,
      predictedScoreB: row.predicted_score_b,
      pointsEarned: row.points_earned,
      isCurrentUser: row.user_id === user.id,
    };
  });

  // Bieżący użytkownik na górze; reszta wg ogólnego rankingu (punkty, tie-breakery).
  predictions.sort((left, right) => {
    if (left.isCurrentUser) return -1;
    if (right.isCurrentUser) return 1;

    return compareRankingStats(
      getRankingStatsFromProfile(profiles.get(left.userId)),
      getRankingStatsFromProfile(profiles.get(right.userId)),
    );
  });

  return { status: "ok", predictions };
}
