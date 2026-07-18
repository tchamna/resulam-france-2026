import { readBookings } from "@/lib/bookings";
import type { LanguageStats } from "@/lib/language-stats";

/** Canonical name → raw alias strings (matched case-insensitively after normalizeKey). */
export const LANGUAGE_ALIAS_GROUPS = [
  {
    canonical: "Nufi",
    aliases: [
      "Nufi",
      "Nufí",
      "fefe",
      "Fée Fee",
      "Fee Fee",
      "Le Feefee",
      "Feefee",
      "Nufi..",
      "Nugi",
    ],
  },
  {
    canonical: "Ghomala",
    aliases: [
      "Ghomala",
      "Ghomalah",
      "Ghomalah (Ouest)",
      "Ghomalah(ouest)",
      "Ghomalah(ouest",
      "Yogam",
    ],
  },
] as const;

const ALIAS_TO_CANONICAL = new Map<string, string>();

for (const group of LANGUAGE_ALIAS_GROUPS) {
  for (const alias of group.aliases) {
    ALIAS_TO_CANONICAL.set(normalizeKey(alias), group.canonical);
  }
}

export function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[.…]+$/g, "")
    .replace(/\s+/g, " ");
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function lookupCanonical(key: string): string | null {
  if (!key || key.length < 2) return null;
  const direct = ALIAS_TO_CANONICAL.get(key);
  if (direct) return direct;
  if (key.startsWith("le ")) {
    const stripped = ALIAS_TO_CANONICAL.get(key.slice(3));
    if (stripped) return stripped;
  }
  return null;
}

export function normalizeLanguageToken(raw: string): string | null {
  const key = normalizeKey(raw);
  if (key.length < 2) return null;
  const canonical = lookupCanonical(key);
  if (canonical) return canonical;
  return titleCase(key);
}

function expandSegment(segment: string): string[] {
  const trimmed = segment.trim();
  if (!trimmed) return [];

  const wholeKey = normalizeKey(trimmed);
  const wholeMatch = lookupCanonical(wholeKey);
  if (wholeMatch) return [wholeMatch];

  const words = wholeKey.split(/\s+/).filter((part) => part.length >= 2);
  if (words.length > 1) {
    const fromWords = words
      .map((word) => normalizeLanguageToken(word))
      .filter((name): name is string => name !== null);
    if (fromWords.length > 0) return fromWords;
  }

  const single = normalizeLanguageToken(trimmed);
  return single ? [single] : [];
}

const FIELD_SPLIT = /[,;/|]|(?:\s+and\s+)|(?:\s+et\s+)/i;

export function expandLanguagesFromBooking(languagesField: string): string[] {
  const segments = languagesField.split(FIELD_SPLIT);
  const names: string[] = [];
  for (const segment of segments) {
    names.push(...expandSegment(segment));
  }
  return names;
}

export async function getNormalizedLanguageStats(): Promise<LanguageStats> {
  const bookings = await readBookings();
  const counts = new Map<string, number>();

  for (const booking of bookings) {
    const unique = new Set(expandLanguagesFromBooking(booking.languages ?? ""));
    for (const language of unique) {
      counts.set(language, (counts.get(language) ?? 0) + 1);
    }
  }

  const languages = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { totalBookings: bookings.length, languages };
}
