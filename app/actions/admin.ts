"use server";

import { revalidatePath } from "next/cache";
import { calculatePoints } from "@/lib/scoring";
import { createClient } from "@/utils/supabase/server";

export type ResolveMatchResult =
  | { success: true; message: string }
  | { success: false; message: string };

function validateScores(
  realScoreA: number,
  realScoreB: number,
): string | null {
  if (
    !Number.isInteger(realScoreA) ||
    !Number.isInteger(realScoreB) ||
    realScoreA < 0 ||
    realScoreB < 0
  ) {
    return "Podaj prawidłowy wynik (liczby całkowite ≥ 0).";
  }
  return null;
}

export async function resolveMatch(
  matchId: string,
  realScoreA: number,
  realScoreB: number,
): Promise<ResolveMatchResult> {
  if (!matchId) {
    return { success: false, message: "Brak identyfikatora meczu." };
  }

  const validationError = validateScores(realScoreA, realScoreB);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const supabase = await createClient();

  const { data: match, error: matchFetchError } = await supabase
    .from("matches")
    .select("status")
    .eq("id", matchId)
    .single();

  if (matchFetchError || !match) {
    console.error("[resolveMatch] match fetch:", matchFetchError?.message);
    return { success: false, message: "Nie znaleziono meczu." };
  }

  if (match.status !== "upcoming") {
    return { success: false, message: "Ten mecz został już rozliczony." };
  }

  const { error: matchUpdateError } = await supabase
    .from("matches")
    .update({
      score_a: realScoreA,
      score_b: realScoreB,
      status: "finished",
    })
    .eq("id", matchId);

  if (matchUpdateError) {
    console.error("[resolveMatch] match update:", matchUpdateError.message);
    return { success: false, message: "Nie udało się zapisać wyniku meczu." };
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("id, user_id, predicted_score_a, predicted_score_b")
    .eq("match_id", matchId);

  if (predictionsError) {
    console.error("[resolveMatch] predictions fetch:", predictionsError.message);
    return { success: false, message: "Nie udało się pobrać typów." };
  }

  for (const prediction of predictions ?? []) {
    const points = calculatePoints(
      prediction.predicted_score_a,
      prediction.predicted_score_b,
      realScoreA,
      realScoreB,
    );

    const { error: predictionUpdateError } = await supabase
      .from("predictions")
      .update({ points_earned: points })
      .eq("id", prediction.id);

    if (predictionUpdateError) {
      console.error(
        "[resolveMatch] prediction update:",
        predictionUpdateError.message,
      );
      return { success: false, message: "Nie udało się zapisać punktów typu." };
    }

    const { data: user, error: userFetchError } = await supabase
      .from("users")
      .select("total_points")
      .eq("id", prediction.user_id)
      .single();

    if (userFetchError || !user) {
      console.error("[resolveMatch] user fetch:", userFetchError?.message);
      return {
        success: false,
        message: "Nie udało się zaktualizować punktów użytkownika.",
      };
    }

    const currentTotal = user.total_points ?? 0;

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ total_points: currentTotal + points })
      .eq("id", prediction.user_id);

    if (userUpdateError) {
      console.error("[resolveMatch] user update:", userUpdateError.message);
      return {
        success: false,
        message: "Nie udało się zaktualizować punktów użytkownika.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");

  const typCount = predictions?.length ?? 0;
  return {
    success: true,
    message:
      typCount > 0
        ? `Mecz rozliczony. Zaktualizowano ${typCount} typów.`
        : "Mecz rozliczony (brak typów do punktacji).",
  };
}
