"use client";

import Image from "next/image";
import { useState } from "react";
import { getFlagUrl } from "@/lib/country-codes";

interface TeamFlagProps {
  code: string;
  teamName: string;
  className?: string;
}

function GlobeFallback({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-zinc-100 text-zinc-400 shadow-sm dark:bg-zinc-800 dark:text-zinc-500 ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-3.5 w-3.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
      </svg>
    </span>
  );
}

export function TeamFlag({ code, teamName, className }: TeamFlagProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <GlobeFallback className={`h-5 w-8 ${className ?? ""}`} />;
  }

  return (
    <Image
      src={getFlagUrl(code, 40)}
      alt={`Flaga: ${teamName}`}
      width={32}
      height={24}
      className={`h-5 w-8 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}
