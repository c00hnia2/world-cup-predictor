export interface Team {
  name: string;
}

export interface Match {
  id: string;
  kickoff_time: string;
  status: string;
  team_a: Team | null;
  team_b: Team | null;
}
