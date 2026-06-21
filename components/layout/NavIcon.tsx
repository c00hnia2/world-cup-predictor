import type { NavItem } from "@/lib/navigation";

interface NavIconProps {
  icon: NavItem["icon"];
  className?: string;
}

export function NavIcon({ icon, className = "h-5 w-5" }: NavIconProps) {
  switch (icon) {
    case "matches":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 3c2.2 2.5 3.5 5.5 3.5 9s-1.3 6.5-3.5 9M12 3C9.8 5.5 8.5 8.5 8.5 12s1.3 6.5 3.5 9M12 3v18M3 12h18"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      );
    case "leaderboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 20V10M12 20V4M17 20v-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M4 20h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "leagues":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 20a4 4 0 0 1 8 0M12 20a4 4 0 0 1 8 0"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "profile":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M5 20a7 7 0 0 1 14 0"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "admin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3 4 7v6c0 4.4 3.4 8.5 8 9 4.6-.5 8-4.6 8-9V7l-8-4Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 12.5 11 14l3.5-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
