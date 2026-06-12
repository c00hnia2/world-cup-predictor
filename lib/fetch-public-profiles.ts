import { createClient } from "@/utils/supabase/server";
import type { PublicProfile } from "@/types/user";

export async function fetchPublicProfilesByIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[],
): Promise<Map<string, PublicProfile>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("public_profiles")
    .select(
      "id, username, total_points, exact_scores_count, correct_outcomes_count",
    )
    .in("id", uniqueIds);

  if (error) {
    console.error("[fetchPublicProfilesByIds]", error.message);
    return new Map();
  }

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}
