/** Skróty na karcie: tylko ustalone formy (USA, RPA…), bez wymyślanych inicjałów. */
const MULTI_WORD_ALIASES: Record<string, string> = {
  "stany zjednoczone": "USA",
  "united states": "USA",
  "united states of america": "USA",

  "republika poludniowej afryki": "RPA",
  "poludniowa afryka": "RPA",
  "afryka poludniowa": "RPA",
  "south africa": "RPA",
  "rpa": "RPA",
  "pa": "RPA",

  "republika zielonego przyladka": "RZP",
  "cape verde": "RZP",
  "rzp": "RZP",

  "korea poludniowa": "Korea Płd",
  "south korea": "Korea Płd",

  "korea polnocna": "Korea Płn",
  "north korea": "Korea Płn",

  "bosnia i hercegowina": "BiH",
  "bosnia and herzegovina": "BiH",

  "zjednoczone emiraty arabskie": "ZEA",
  "united arab emirates": "ZEA",

  "arabia saudyjska": "Arabia Saudyjska",
  "saudi arabia": "Arabia Saudyjska",
  "saudia": "Arabia Saudyjska",

  "nowa zelandia": "Nowa Zelandia",
  "new zealand": "Nowa Zelandia",
  "zelandia": "Nowa Zelandia",

  "papua nowa gwinea": "PNG",
  "papua new guinea": "PNG",

  "trynidad i tobago": "Trynidad",
  "trinidad and tobago": "Trynidad",

  "antigua i barbuda": "Antigua",
  "antigua and barbuda": "Antigua",

  "wyspy salomona": "Salomony",
  "solomon islands": "Salomony",

  "republika kongo": "Kongo",
  "congo": "Kongo",

  "demokratyczna republika kongo": "DR Kongo",
  "democratic republic of the congo": "DR Kongo",
  "congo dr": "DR Kongo",

  "wyspy swietego tomasza i ksiazeca": "Sao Tome",
  "sao tome and principe": "Sao Tome",

  "saint vincent i grenadyny": "Vincent",
  "saint vincent and the grenadines": "Vincent",

  "cote divoire": "WKS",
  "wybrzeze kosci sloniowej": "WKS",
  "ivory coast": "WKS",

  "kraj basenu jeziora wiktoria": "Wiktoria",
  "lake victoria basin": "Wiktoria",

  "republika czeska": "Czechy",
  "czech republic": "Czechy",
  "czechia": "Czechy",

  "wielka brytania": "UK",
  "united kingdom": "UK",
  "great britain": "UK",

  "kostaryka": "Kostaryka",
  "costa rica": "Kostaryka",
};

const DR_CONGO_LABELS: Record<string, string> = {
  kongo: "Kongo",
};

/** ASCII do dopasowań — ł/ą itd. nie znikają po samym NFD. */
export function normalizeTeamKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[ąćęńóśźż]/g, (ch) =>
      ({ ą: "a", ć: "c", ę: "e", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" })[
        ch as "ą" | "ć" | "ę" | "ń" | "ó" | "ś" | "ź" | "ż"
      ] ?? ch,
    )
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function capitalizePhrase(phrase: string): string {
  return phrase
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Republika Południowej Afryki i potoczne warianty — zawsze RPA. */
function isSouthAfrica(key: string): boolean {
  if (key === "pa" || key === "rpa") return true;
  if (key.includes("south africa")) return true;
  if (key.includes("republika") && key.includes("poludniow") && key.includes("afryk")) {
    return true;
  }
  return key.includes("poludniow") && key.includes("afryk");
}

function abbreviateByPattern(key: string): string | null {
  if (isSouthAfrica(key)) return "RPA";

  const drMatch = key.match(/^demokratyczna republika (.+)$/);
  if (drMatch) {
    const place = drMatch[1];
    return `DR ${DR_CONGO_LABELS[place] ?? capitalizePhrase(place)}`;
  }

  const repMatch = key.match(/^republika (.+)$/);
  if (repMatch) {
    const rest = repMatch[1];
    if (rest.includes("poludniowej") && rest.includes("afryk")) return "RPA";
    if (rest.includes("zielonego przyladka")) return "RZP";
    if (rest === "kongo") return "Kongo";
  }

  return null;
}

/**
 * Krótka nazwa na karcie meczu — pełna nazwa w title przy skrócie.
 */
export function formatTeamDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const key = normalizeTeamKey(trimmed);
  if (isSouthAfrica(key)) return "RPA";

  const alias = MULTI_WORD_ALIASES[key];
  if (alias) return alias;

  const patterned = abbreviateByPattern(key);
  if (patterned) return patterned;

  return trimmed;
}

/** Pełna nazwa do podpowiedzi (title), gdy wyświetlany jest skrót. */
export function teamDisplayTitle(
  originalName: string,
  displayName: string,
): string | undefined {
  if (originalName.trim() === displayName) return undefined;
  return originalName.trim();
}
