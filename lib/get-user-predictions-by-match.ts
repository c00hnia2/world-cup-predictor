import type { ExistingMatchPrediction } from "@/types/prediction";
import { createClient } from "@/utils/supabase/server";

export async function getUserPredictionsByMatchId(): Promise<
  Record<string, ExistingMatchPrediction>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {};
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("match_id, predicted_score_a, predicted_score_b")
    .eq("user_id", user.id);

  if (error) {
    console.error("[getUserPredictionsByMatchId] fetch:", error.message);
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((prediction) => [
      prediction.match_id,
      {
        predicted_score_a: prediction.predicted_score_a,
        predicted_score_b: prediction.predicted_score_b,
      },
    ]),
  );
}
