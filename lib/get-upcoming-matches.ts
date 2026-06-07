import { unstable_cache } from "next/cache";
import { normalizeMatch } from "@/lib/normalize-match";
import { createPublicClient } from "@/utils/supabase/public";
import type { Match } from "@/types/match";

export const MATCHES_CACHE_TAG = "matches";

export interface UpcomingMatchesResult {
  matches: Match[];
  hasError: boolean;
}

const MATCHES_SELECT =
  "id, kickoff_time, status, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)";

// Lista nadchodzących meczów jest taka sama dla każdego użytkownika, dlatego
// cache'ujemy ją współdzielenie (1 zapytanie do bazy zamiast N per request).
// Inwalidacja: revalidateTag(MATCHES_CACHE_TAG) po rozliczeniu/edycji meczu.
export const getUpcomingMatches = unstable_cache(
  async (): Promise<UpcomingMatchesResult> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("matches")
      .select(MATCHES_SELECT)
      .eq("status", "upcoming")
      .order("kickoff_time", { ascending: true });

    if (error) {
      console.error("[getUpcomingMatches] fetch error:", error.message);
      return { matches: [], hasError: true };
    }

    return { matches: (data ?? []).map(normalizeMatch), hasError: false };
  },
  ["upcoming-matches"],
  { tags: [MATCHES_CACHE_TAG], revalidate: 300 },
);
