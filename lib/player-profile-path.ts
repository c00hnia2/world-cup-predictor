export function getPlayerProfilePath(
  username: string | null | undefined,
  displayName?: string,
): string {
  const slug = (username?.trim() || displayName?.trim() || "").trim();

  if (!slug) {
    return "/profile";
  }

  return `/profile/${encodeURIComponent(slug)}`;
}

export const playerNameLinkClassName =
  "cursor-pointer transition-colors hover:text-emerald-600 hover:underline dark:hover:text-emerald-400";
