export interface NavItem {
  href: string;
  label: string;
  icon: "matches" | "leaderboard" | "leagues" | "admin";
  adminOnly?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Mecze", icon: "matches" },
  { href: "/leaderboard", label: "Ranking", icon: "leaderboard" },
  { href: "/leagues", label: "Ligi", icon: "leagues" },
  { href: "/admin", label: "Admin", icon: "admin", adminOnly: true },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
