import { unstable_cache } from "next/cache";
import { normalizeMatch } from "@/lib/normalize-match";
import { createPublicClient } from "@/utils/supabase/public";
import type { Match } from "@/types/match";
import { MATCHES_CACHE_TAG } from "@/lib/get-upcoming-matches";

export interface FinishedMatchesResult {
  matches: Match[];
  hasError: boolean;
}

const FINISHED_MATCHES_SELECT =
  "id, kickoff_time, status, score_a, score_b, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)";

export const getFinishedMatches = unstable_cache(
  async (): Promise<FinishedMatchesResult> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("matches")
      .select(FINISHED_MATCHES_SELECT)
      .eq("status", "finished")
      .order("kickoff_time", { ascending: false });

    if (error) {
      console.error("[getFinishedMatches] fetch error:", error.message);
      return { matches: [], hasError: true };
    }

    return { matches: (data ?? []).map(normalizeMatch), hasError: false };
  },
  ["finished-matches"],
  { tags: [MATCHES_CACHE_TAG], revalidate: 300 },
);
