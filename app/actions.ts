"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { PredictionFormState } from "@/types/prediction";

// MVP bez logowania — ID gracza zakodowane na sztywno.
// Podmień na realny UUID z tabeli `users` w Supabase.
const TEST_USER_ID = "TWOJE_UUID_TUTAJ";

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

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: TEST_USER_ID,
      match_id: matchId,
      predicted_score_a: score_a,
      predicted_score_b: score_b,
    },
    { onConflict: "user_id, match_id" },
  );

  if (error) {
    console.error("[submitPrediction] upsert error:", error.message);
    return {
      status: "error",
      message: "Nie udało się zapisać typu. Spróbuj ponownie.",
    };
  }

  revalidatePath("/");

  return { status: "success", message: "Typ zapisany!" };
}
