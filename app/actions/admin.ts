"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { MATCHES_CACHE_TAG } from "@/lib/get-upcoming-matches";
import { requireAdminAccess } from "@/lib/require-admin";
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
  // Wczesna kontrola uprawnień dla lepszego UX (twardą gwarancję daje RPC + RLS).
  const adminCheck = await requireAdminAccess();
  if (!adminCheck.authorized) {
    return { success: false, message: adminCheck.message };
  }

  if (!matchId) {
    return { success: false, message: "Brak identyfikatora meczu." };
  }

  const validationError = validateScores(realScoreA, realScoreB);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const supabase = await createClient();

  // Całość rozliczenia (wynik + punkty + total_points) jest atomowa po stronie bazy.
  const { data: affectedPredictions, error } = await supabase.rpc(
    "resolve_match",
    {
      p_match_id: matchId,
      p_score_a: realScoreA,
      p_score_b: realScoreB,
    },
  );

  if (error) {
    console.error("[resolveMatch] rpc:", error.message);

    if (error.message.includes("Nie znaleziono meczu")) {
      return { success: false, message: "Ten mecz został już rozliczony." };
    }

    if (error.message.includes("Brak uprawnień")) {
      return { success: false, message: "Brak uprawnień." };
    }

    return { success: false, message: "Nie udało się rozliczyć meczu." };
  }

  // Rozliczony mecz znika z listy 'upcoming' — natychmiastowa inwalidacja
  // współdzielonego cache (expire: 0), żeby admin nie zobaczył go ponownie.
  revalidateTag(MATCHES_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/leaderboard");

  const count = typeof affectedPredictions === "number" ? affectedPredictions : 0;
  return {
    success: true,
    message:
      count > 0
        ? `Mecz rozliczony. Zaktualizowano ${count} typów.`
        : "Mecz rozliczony (brak typów do punktacji).",
  };
}

export type AdminActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function saveTournamentResults(
  actualWinnerId: string,
  actualTopScorerId: string,
): Promise<AdminActionResult> {
  const adminCheck = await requireAdminAccess();
  if (!adminCheck.authorized) {
    return { success: false, message: adminCheck.message };
  }

  if (!actualWinnerId || !actualTopScorerId) {
    return {
      success: false,
      message: "Wybierz faktycznego zwycięzcę i króla strzelców.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tournament_results")
    .update({
      actual_winner_id: actualWinnerId,
      actual_top_scorer_id: actualTopScorerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[saveTournamentResults]", error.message);
    return {
      success: false,
      message: "Nie udało się zapisać wyników turnieju.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    message: "Wyniki turnieju zapisane.",
  };
}

export async function resolveTournamentPredictions(): Promise<AdminActionResult> {
  const adminCheck = await requireAdminAccess();
  if (!adminCheck.authorized) {
    return { success: false, message: adminCheck.message };
  }

  const supabase = await createClient();

  const { data: affectedCount, error } = await supabase.rpc(
    "resolve_tournament_predictions",
  );

  if (error) {
    console.error("[resolveTournamentPredictions] rpc:", error.message);

    if (error.message.includes("Ustaw faktycznego zwycięzcę")) {
      return {
        success: false,
        message:
          "Ustaw faktycznego zwycięzcę i króla strzelców przed rozliczeniem.",
      };
    }

    if (error.message.includes("Brak uprawnień")) {
      return { success: false, message: "Brak uprawnień." };
    }

    return {
      success: false,
      message: "Nie udało się rozliczyć typów turniejowych.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/leaderboard");

  const count = typeof affectedCount === "number" ? affectedCount : 0;
  return {
    success: true,
    message:
      count > 0
        ? `Typy turniejowe rozliczone. Zaktualizowano ${count} typów (max 15 pkt na użytkownika).`
        : "Typy turniejowe rozliczone (brak typów do punktacji).",
  };
}
