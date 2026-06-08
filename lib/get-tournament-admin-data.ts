import { createClient } from "@/utils/supabase/server";
import type { Player } from "@/types/player";
import type {
  TeamOption,
  TournamentResults,
} from "@/types/tournament_prediction";

export async function getTournamentAdminData(): Promise<{
  teams: TeamOption[];
  players: Player[];
  results: TournamentResults | null;
  hasError: boolean;
}> {
  const supabase = await createClient();

  const [teamsResult, playersResult, resultsResult] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase.from("players").select("id, name").order("name"),
    supabase
      .from("tournament_results")
      .select("actual_winner_id, actual_top_scorer_id, resolved_at")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (teamsResult.error || playersResult.error || resultsResult.error) {
    console.error("[getTournamentAdminData]", {
      teams: teamsResult.error?.message,
      players: playersResult.error?.message,
      results: resultsResult.error?.message,
    });
    return { teams: [], players: [], results: null, hasError: true };
  }

  return {
    teams: teamsResult.data ?? [],
    players: playersResult.data ?? [],
    results: resultsResult.data,
    hasError: false,
  };
}
