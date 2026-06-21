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

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export function isSameProfilePath(
  currentPathname: string,
  profilePath: string,
  pageProfile?: {
    username?: string | null;
    displayName?: string;
  },
): boolean {
  if (currentPathname === profilePath) {
    return true;
  }

  if (decodePath(currentPathname) === decodePath(profilePath)) {
    return true;
  }

  if (currentPathname === "/profile" && pageProfile) {
    const ownerPath = getPlayerProfilePath(
      pageProfile.username,
      pageProfile.displayName,
    );

    return (
      profilePath === ownerPath ||
      decodePath(profilePath) === decodePath(ownerPath)
    );
  }

  return false;
}

export function toStaticPlayerNameClassName(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => {
      if (!token) {
        return false;
      }

      if (token === "cursor-pointer" || token === "underline") {
        return false;
      }

      if (token.includes("hover:")) {
        return false;
      }

      return !token.startsWith("focus:");
    })
    .join(" ");
}

export const playerNameLinkClassName =
  "cursor-pointer transition-colors hover:text-emerald-600 hover:underline dark:hover:text-emerald-400";
