export interface PublicProfile {
  id: string;
  username: string | null;
  total_points: number | null;
  exact_scores_count: number | null;
  correct_outcomes_count: number | null;
}

export interface UserProfile extends PublicProfile {
  email: string | null;
}

export interface LeaderboardEntry extends PublicProfile {
  displayName: string;
  position: number;
}

export function getUserDisplayName(
  profile: Pick<PublicProfile, "username"> & { email?: string | null },
): string {
  if (
    typeof profile.username === "string" &&
    profile.username.trim().length > 0
  ) {
    return profile.username.trim();
  }

  if (typeof profile.email === "string" && profile.email.includes("@")) {
    return profile.email.split("@")[0];
  }

  return "Gracz";
}
