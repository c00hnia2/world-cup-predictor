import { createClient } from "@/utils/supabase/server";
import {
  canSubmitTournamentPrediction,
  isTournamentPredictionLocked,
} from "@/lib/tournament-lock";
import { normalizeTournamentPrediction } from "@/lib/normalize-tournament-prediction";
import type { TournamentPredictionData } from "@/types/tournament_prediction";

export async function getTournamentPredictionData(): Promise<TournamentPredictionData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const [
    teamsResult,
    playersResult,
    predictionResult,
    firstMatchResult,
  ] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase.from("players").select("id, name").order("name"),
    supabase
      .from("tournament_predictions")
      .select(
        `
        id,
        user_id,
        predicted_winner_id,
        predicted_top_scorer_id,
        points_earned,
        predicted_winner:teams!predicted_winner_id(id, name),
        predicted_top_scorer:players!predicted_top_scorer_id(id, name)
      `,
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("kickoff_time")
      .order("kickoff_time", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamsResult.error || playersResult.error || predictionResult.error) {
    console.error("[getTournamentPredictionData]", {
      teams: teamsResult.error?.message,
      players: playersResult.error?.message,
      prediction: predictionResult.error?.message,
    });
    return { status: "error" };
  }

  const firstMatchKickoff = firstMatchResult.data?.kickoff_time ?? null;
  const isLocked = isTournamentPredictionLocked(firstMatchKickoff);

  return {
    status: "ok",
    prediction: predictionResult.data
      ? normalizeTournamentPrediction(predictionResult.data)
      : null,
    isLocked,
    teams: teamsResult.data ?? [],
    players: playersResult.data ?? [],
  };
}

export async function getFirstMatchKickoff(): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select("kickoff_time")
    .order("kickoff_time", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getFirstMatchKickoff]", error.message);
    return null;
  }

  return data?.kickoff_time ?? null;
}

export { canSubmitTournamentPrediction };
