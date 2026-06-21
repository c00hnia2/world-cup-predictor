import { fetchPublicProfilesByIds } from "@/lib/fetch-public-profiles";
import { normalizeTournamentPrediction } from "@/lib/normalize-tournament-prediction";
import { getUserDisplayName } from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export interface TournamentPredictionEntry {
  userId: string;
  displayName: string;
  username: string | null;
  winnerName: string;
  topScorerName: string;
  pointsEarned: number | null;
  isCurrentUser: boolean;
}

export type AllTournamentPredictionsResult =
  | { status: "ok"; predictions: TournamentPredictionEntry[] }
  | { status: "unauthenticated" }
  | { status: "error" };

type TournamentPredictionRow = {
  user_id: string;
  points_earned: number | null;
  predicted_winner: { id: string; name: string } | { id: string; name: string }[] | null;
  predicted_top_scorer: { id: string; name: string } | { id: string; name: string }[] | null;
};

export async function getAllTournamentPredictions(): Promise<AllTournamentPredictionsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("tournament_predictions")
    .select(
      `
      user_id,
      points_earned,
      predicted_winner:teams!predicted_winner_id(id, name),
      predicted_top_scorer:players!predicted_top_scorer_id(id, name)
    `,
    );

  if (error) {
    console.error("[getAllTournamentPredictions]", error.message);
    return { status: "error" };
  }

  const rows = (data ?? []) as unknown as TournamentPredictionRow[];
  const profiles = await fetchPublicProfilesByIds(
    supabase,
    rows.map((row) => row.user_id),
  );

  const predictions = rows.map((row) => {
    const normalized = normalizeTournamentPrediction({
      id: "",
      user_id: row.user_id,
      predicted_winner_id: "",
      predicted_top_scorer_id: "",
      points_earned: row.points_earned,
      predicted_winner: row.predicted_winner,
      predicted_top_scorer: row.predicted_top_scorer,
    });
    const profile = profiles.get(row.user_id);

    return {
      userId: row.user_id,
      displayName: getUserDisplayName({
        username: profile?.username ?? null,
      }),
      username: profile?.username ?? null,
        winnerName: normalized.predicted_winner?.name ?? "—",
        topScorerName: normalized.predicted_top_scorer?.name ?? "—",
        pointsEarned: row.points_earned,
        isCurrentUser: row.user_id === user.id,
      };
  });

  predictions.sort((left, right) => {
    if (left.isCurrentUser) return -1;
    if (right.isCurrentUser) return 1;
    return left.displayName.localeCompare(right.displayName, "pl");
  });

  return { status: "ok", predictions };
}
