"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getPlayerProfilePath,
  playerNameLinkClassName,
} from "@/lib/player-profile-path";

interface PlayerNameLinkProps {
  username?: string | null;
  displayName: string;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
  /** Użyj w kontrolkach (np. przycisk porównania), gdzie Link wewnątrz button byłby niepoprawny HTML-em. */
  asSpan?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function PlayerNameLink({
  username,
  displayName,
  className = "",
  title,
  style,
  asSpan = false,
  onClick,
}: PlayerNameLinkProps) {
  const router = useRouter();
  const href = getPlayerProfilePath(username, displayName);
  const combinedClassName = `${playerNameLinkClassName} ${className}`.trim();

  if (asSpan) {
    return (
      <span
        role="link"
        tabIndex={0}
        title={title ?? displayName}
        className={combinedClassName}
        style={style}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) {
            return;
          }

          router.push(href);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          onClick?.(event as unknown as React.MouseEvent<HTMLElement>);
          if (event.defaultPrevented) {
            return;
          }

          router.push(href);
        }}
      >
        {displayName}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={title ?? displayName}
      onClick={onClick}
      style={style}
      className={combinedClassName}
    >
      {displayName}
    </Link>
  );
}
