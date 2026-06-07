import { isAdminRole } from "@/types/role";
import { createClient } from "@/utils/supabase/server";

export interface NavUser {
  isLoggedIn: boolean;
  username: string | null;
  isAdmin: boolean;
}

function getUsernameFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const username = metadata?.username;
  if (typeof username === "string" && username.trim().length > 0) {
    return username.trim();
  }

  const displayName = metadata?.display_name;
  if (typeof displayName === "string" && displayName.trim().length > 0) {
    return displayName.trim();
  }

  return null;
}

export async function getNavUser(): Promise<NavUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, username: null, isAdmin: false };
  }

  const metadataUsername = getUsernameFromMetadata(user.user_metadata);
  const { data: profile } = await supabase
    .from("users")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  let username = metadataUsername;

  if (
    !username &&
    typeof profile?.username === "string" &&
    profile.username.trim().length > 0
  ) {
    username = profile.username.trim();
  }

  if (!username && user.email) {
    username = user.email.split("@")[0];
  }

  return {
    isLoggedIn: true,
    username,
    isAdmin: isAdminRole(profile?.role),
  };
}
