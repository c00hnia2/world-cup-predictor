"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  canSubmitTournamentPrediction,
  getFirstMatchKickoff,
} from "@/lib/get-tournament-prediction-data";
import {
  getAllTournamentPredictions,
  type AllTournamentPredictionsResult,
} from "@/lib/get-tournament-predictions";
import { getTournamentLockMessage } from "@/lib/tournament-lock";
import type { TournamentPredictionFormState } from "@/types/tournament_prediction";

function mapTournamentPredictionError(message: string): string {
  if (message.includes("invalid input syntax for type uuid")) {
    return "Sesja wygasła. Zaloguj się ponownie.";
  }

  if (message.includes("Typowanie turniejowe jest zamknięte")) {
    return getTournamentLockMessage();
  }

  return "Nie udało się zapisać typu turniejowego. Spróbuj ponownie.";
}

export async function submitTournamentPrediction(
  prevState: TournamentPredictionFormState,
  formData: FormData,
): Promise<TournamentPredictionFormState> {
  const predictedWinnerId = formData.get("predicted_winner_id");
  const predictedTopScorerId = formData.get("predicted_top_scorer_id");

  if (
    typeof predictedWinnerId !== "string" ||
    predictedWinnerId.length === 0 ||
    typeof predictedTopScorerId !== "string" ||
    predictedTopScorerId.length === 0
  ) {
    return {
      status: "error",
      message: "Wybierz zwycięzcę turnieju i króla strzelców.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Zaloguj się, aby zapisać typ turniejowy.",
    };
  }

  const firstMatchKickoff = await getFirstMatchKickoff();

  if (!canSubmitTournamentPrediction(firstMatchKickoff)) {
    return {
      status: "error",
      message: getTournamentLockMessage(),
    };
  }

  const { data: existingPrediction } = await supabase
    .from("tournament_predictions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isUpdate = Boolean(existingPrediction);

  const { error } = await supabase.from("tournament_predictions").upsert(
    {
      user_id: user.id,
      predicted_winner_id: predictedWinnerId,
      predicted_top_scorer_id: predictedTopScorerId,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[submitTournamentPrediction] upsert:", error.message);
    return {
      status: "error",
      message: mapTournamentPredictionError(error.message),
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: isUpdate
      ? "Typ turniejowy zaktualizowany!"
      : "Typ turniejowy zapisany!",
  };
}

export async function fetchTournamentPredictions(): Promise<AllTournamentPredictionsResult> {
  return getAllTournamentPredictions();
}
