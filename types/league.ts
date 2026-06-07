export interface League {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface LeagueSummary {
  id: string;
  name: string;
  created_at: string;
}

export interface LeagueMemberWithProfile {
  joined_at: string;
  user: {
    id: string;
    username: string | null;
    email: string | null;
    total_points: number | null;
  } | null;
}

export interface LeagueRankEntry {
  position: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  joinedAt: string;
}

export interface LeagueDetailData {
  league: League;
  ranking: LeagueRankEntry[];
}

export type LeagueDetailResult =
  | { status: "ok"; data: LeagueDetailData }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "access_denied" };

export interface LeagueFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    name?: string;
    inviteCode?: string;
  };
}

export const initialLeagueFormState: LeagueFormState = {
  status: "idle",
  message: "",
};

export const INVITE_CODE_LENGTH = 6;

export const INVITE_CODE_PATTERN = /^[A-Z0-9]{6}$/;
