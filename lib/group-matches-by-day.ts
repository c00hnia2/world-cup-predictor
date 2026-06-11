import type { Match } from "@/types/match";

const TIME_ZONE = "Europe/Warsaw";

function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Klucz sortowania: data kalendarzowa w strefie Warszawy (YYYY-MM-DD). */
export function getDaySortKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

/** Etykieta nagłówka, np. "Czwartek, 11 Czerwca". */
export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    timeZone: TIME_ZONE,
  }).format(date);
  const day = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
  const month = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    timeZone: TIME_ZONE,
  }).format(date);

  return `${capitalizeWord(weekday)}, ${day} ${capitalizeWord(month)}`;
}

export interface MatchesByDay {
  sortKey: string;
  label: string;
  matches: Match[];
}

export function groupMatchesByDay(
  matches: Match[],
  options?: { order?: "asc" | "desc" },
): MatchesByDay[] {
  const order = options?.order ?? "asc";
  const groups = new Map<string, MatchesByDay>();

  for (const match of matches) {
    const sortKey = getDaySortKey(match.kickoff_time);

    if (!groups.has(sortKey)) {
      groups.set(sortKey, {
        sortKey,
        label: formatDayLabel(match.kickoff_time),
        matches: [],
      });
    }

    groups.get(sortKey)!.matches.push(match);
  }

  const sorted = Array.from(groups.values()).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey),
  );

  return order === "desc" ? sorted.reverse() : sorted;
}
