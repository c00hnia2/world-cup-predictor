"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  canSubmitPrediction,
  getPredictionLockMessage,
} from "@/lib/prediction-lock";
import type { PredictionFormState } from "@/types/prediction";

function mapPredictionError(message: string): string {
  if (message.includes("row-level security")) {
    return "Brak uprawnień do zapisu typu. Uruchom w Supabase plik supabase/predictions-rls.sql.";
  }

  if (message.includes("invalid input syntax for type uuid")) {
    return "Sesja wygasła. Zaloguj się ponownie.";
  }

  return `Nie udało się zapisać typu: ${message}`;
}

export async function submitPrediction(
  prevState: PredictionFormState,
  formData: FormData,
): Promise<PredictionFormState> {
  const matchId = formData.get("match_id");
  const rawScoreA = formData.get("score_a");
  const rawScoreB = formData.get("score_b");

  const score_a = Number(rawScoreA);
  const score_b = Number(rawScoreB);

  if (typeof matchId !== "string" || matchId.length === 0) {
    return { status: "error", message: "Brak identyfikatora meczu." };
  }

  if (
    rawScoreA === null ||
    rawScoreB === null ||
    !Number.isInteger(score_a) ||
    !Number.isInteger(score_b) ||
    score_a < 0 ||
    score_b < 0
  ) {
    return {
      status: "error",
      message: "Podaj prawidłowy wynik (liczby całkowite ≥ 0).",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Zaloguj się, aby zapisać typ.",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("status, kickoff_time")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    console.error("[submitPrediction] match fetch:", matchError.message);
    return {
      status: "error",
      message: "Nie udało się zweryfikować meczu.",
    };
  }

  if (!match) {
    return { status: "error", message: "Nie znaleziono meczu." };
  }

  if (match.status !== "upcoming") {
    return {
      status: "error",
      message: "Typy można składać tylko przed rozpoczęciem meczu.",
    };
  }

  if (!canSubmitPrediction(match.kickoff_time, match.status)) {
    return {
      status: "error",
      message: getPredictionLockMessage(),
    };
  }

  const { data: existingPrediction } = await supabase
    .from("predictions")
    .select("id")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .maybeSingle();

  const isUpdate = Boolean(existingPrediction);

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      predicted_score_a: score_a,
      predicted_score_b: score_b,
    },
    { onConflict: "user_id,match_id" },
  );

  if (error) {
    console.error("[submitPrediction] upsert error:", error.message);
    return {
      status: "error",
      message: mapPredictionError(error.message),
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: isUpdate ? "Typ zaktualizowany!" : "Typ zapisany!",
  };
}
