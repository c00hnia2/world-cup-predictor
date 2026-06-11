export interface Team {
  name: string;
}

export interface Match {
  id: string;
  kickoff_time: string;
  status: string;
  score_a?: number | null;
  score_b?: number | null;
  team_a: Team | null;
  team_b: Team | null;
}
