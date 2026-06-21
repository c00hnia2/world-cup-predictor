import { normalizeUserPrediction } from "@/lib/normalize-prediction";
import type { UserPredictionsResult } from "@/types/prediction";
import { createClient } from "@/utils/supabase/server";

const PREDICTIONS_SELECT = `
  id,
  predicted_score_a,
  predicted_score_b,
  points_earned,
  match:matches(
    id,
    kickoff_time,
    status,
    score_a,
    score_b,
    team_a:teams!team_a_id(name),
    team_b:teams!team_b_id(name)
  )
`;

async function fetchPredictionsForUser(
  userId: string,
): Promise<UserPredictionsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select(PREDICTIONS_SELECT)
    .eq("user_id", userId)
    .order("kickoff_time", { ascending: true, foreignTable: "matches" });

  if (error) {
    console.error("[getUserPredictions] fetch:", error.message);
    return { status: "error" };
  }

  const predictions = (data ?? [])
    .map(normalizeUserPrediction)
    .filter((entry) => entry.match !== null)
    .sort(
      (left, right) =>
        new Date(left.match!.kickoff_time).getTime() -
        new Date(right.match!.kickoff_time).getTime(),
    );

  return { status: "ok", predictions };
}

export async function getUserPredictions(): Promise<UserPredictionsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  return fetchPredictionsForUser(user.id);
}

export async function getPredictionsForUser(
  userId: string,
): Promise<UserPredictionsResult> {
  return fetchPredictionsForUser(userId);
}
