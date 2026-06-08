import { createClient } from "@/utils/supabase/server";
import type { Player } from "@/types/player";

export async function getPlayers(): Promise<{
  players: Player[];
  hasError: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("[getPlayers]", error.message);
    return { players: [], hasError: true };
  }

  return { players: data ?? [], hasError: false };
}
