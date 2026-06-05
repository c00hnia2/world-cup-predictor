import { normalizeTeamKey } from "@/lib/format-team-name";

/**
 * Mapowanie nazw reprezentacji (PL / EN / skróty z UI) → kod ISO dla flagcdn.com.
 * Wszystkie 48 drużyn MŚ 2026 + typowe warianty zapisu.
 */
export const teamToCountryCode: Record<string, string> = {
  // Gospodarze
  kanada: "ca",
  canada: "ca",
  meksyk: "mx",
  mexico: "mx",
  "stany zjednoczone": "us",
  usa: "us",
  "united states": "us",
  "united states of america": "us",

  // AFC
  australia: "au",
  iran: "ir",
  "ir iran": "ir",
  irak: "iq",
  iraq: "iq",
  japonia: "jp",
  japan: "jp",
  jordania: "jo",
  jordan: "jo",
  "korea poludniowa": "kr",
  "korea poludniowej": "kr",
  "south korea": "kr",
  "korea republic": "kr",
  "korea poludniowa republika": "kr",
  "korea pld": "kr",
  katar: "qa",
  qatar: "qa",
  "arabia saudyjska": "sa",
  "saudi arabia": "sa",
  saudia: "sa",
  uzbekistan: "uz",

  // CAF
  algieria: "dz",
  algeria: "dz",
  "republika zielonego przyladka": "cv",
  "cape verde": "cv",
  "cabo verde": "cv",
  rzp: "cv",
  "demokratyczna republika kongo": "cd",
  "demokratyczna republika konga": "cd",
  "demokratyczna republika congo": "cd",
  "democratic republic of the congo": "cd",
  "congo dr": "cd",
  "congo drc": "cd",
  "dr congo": "cd",
  "dr kongo": "cd",
  "dr konga": "cd",
  "kongo dr": "cd",
  "drc": "cd",
  cod: "cd",
  egipt: "eg",
  egypt: "eg",
  ghana: "gh",
  "wybrzeze kosci sloniowej": "ci",
  "cote divoire": "ci",
  "ivory coast": "ci",
  wks: "ci",
  maroko: "ma",
  morocco: "ma",
  senegal: "sn",
  "republika poludniowej afryki": "za",
  "poludniowa afryka": "za",
  "afryka poludniowa": "za",
  "south africa": "za",
  rpa: "za",
  tunezja: "tn",
  tunisia: "tn",

  // CONCACAF
  curacao: "cw",
  "curaçao": "cw",
  haiti: "ht",
  panama: "pa",

  // CONMEBOL
  argentyna: "ar",
  argentina: "ar",
  brazylia: "br",
  brazil: "br",
  kolumbia: "co",
  colombia: "co",
  ekwador: "ec",
  ecuador: "ec",
  paragwaj: "py",
  paraguay: "py",
  urugwaj: "uy",
  uruguay: "uy",

  // OFC
  "nowa zelandia": "nz",
  "new zealand": "nz",
  zelandia: "nz",

  // UEFA
  austria: "at",
  belgia: "be",
  belgium: "be",
  "bosnia i hercegowina": "ba",
  "bosnia and herzegovina": "ba",
  bih: "ba",
  chorwacja: "hr",
  croatia: "hr",
  czechy: "cz",
  czechia: "cz",
  "czech republic": "cz",
  "republika czeska": "cz",
  anglia: "gb-eng",
  england: "gb-eng",
  francja: "fr",
  france: "fr",
  niemcy: "de",
  germany: "de",
  holandia: "nl",
  netherlands: "nl",
  norwegia: "no",
  norway: "no",
  portugalia: "pt",
  portugal: "pt",
  szkocja: "gb-sct",
  scotland: "gb-sct",
  hiszpania: "es",
  spain: "es",
  szwecja: "se",
  sweden: "se",
  szwajcaria: "ch",
  switzerland: "ch",
  turcja: "tr",
  turkiye: "tr",
  turkey: "tr",

  // Potoczne / skróty wyświetlane na kartach
  "zjednoczone emiraty arabskie": "ae",
  "united arab emirates": "ae",
  zea: "ae",
  "republika kongo": "cg",
  congo: "cg",
  kongo: "cg",
  "papua nowa gwinea": "pg",
  "papua new guinea": "pg",
  png: "pg",
  "wielka brytania": "gb",
  "united kingdom": "gb",
  uk: "gb",
  kostaryka: "cr",
  "costa rica": "cr",
};

export function getCountryCode(teamName: string): string | null {
  const trimmed = teamName.trim();
  if (!trimmed || trimmed === "—") return null;

  const key = normalizeTeamKey(trimmed);
  const direct = teamToCountryCode[key];
  if (direct) return direct;

  if (key.includes("poludniow") && key.includes("afryk")) return "za";
  if (key.includes("zielonego") && key.includes("przylad")) return "cv";

  const isDrCongo =
    (key.includes("demokratyczna") ||
      key.includes("democratic") ||
      key.startsWith("dr ")) &&
    (key.includes("kongo") || key.includes("konga") || key.includes("congo"));
  if (isDrCongo) return "cd";

  return null;
}

export function getFlagUrl(code: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${code}.png`;
}
