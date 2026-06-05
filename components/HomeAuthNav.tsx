import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/utils/supabase/server";

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

async function getLoggedInUsername(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metadataUsername = getUsernameFromMetadata(user.user_metadata);
  if (metadataUsername) {
    return metadataUsername;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (typeof profile?.username === "string" && profile.username.trim().length > 0) {
    return profile.username.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return null;
}

export async function HomeAuthNav() {
  const username = await getLoggedInUsername();

  if (username) {
    return (
      <nav
        aria-label="Konto użytkownika"
        className="flex items-center justify-end gap-3 sm:gap-4"
      >
        <p className="text-base font-semibold text-emerald-600 sm:text-lg dark:text-emerald-400">
          {username}
        </p>
        <LogoutButton />
      </nav>
    );
  }

  return (
    <nav
      aria-label="Konto użytkownika"
      className="flex items-center justify-end gap-2 sm:gap-3"
    >
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        Zaloguj się
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all hover:from-emerald-400 hover:to-emerald-500"
      >
        Zarejestruj się
      </Link>
    </nav>
  );
}
