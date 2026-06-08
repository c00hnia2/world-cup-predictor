import { createClient } from "@/utils/supabase/server";
import type { TeamOption } from "@/types/tournament_prediction";

export async function getTeams(): Promise<{
  teams: TeamOption[];
  hasError: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("[getTeams]", error.message);
    return { teams: [], hasError: true };
  }

  return { teams: data ?? [], hasError: false };
}
