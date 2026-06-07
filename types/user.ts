export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  total_points: number | null;
}

export interface LeaderboardEntry extends UserProfile {
  displayName: string;
  position: number;
}

export function getUserDisplayName(
  profile: Pick<UserProfile, "username" | "email">,
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
