import { readBookings } from "@/lib/bookings";

export type LanguageStat = {
  name: string;
  count: number;
};

export type LanguageStats = {
  totalBookings: number;
  languages: LanguageStat[];
};

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseLanguageTokens(raw: string): string[] {
  return raw
    .split(/[,;/|]|(?:\s+and\s+)|(?:\s+et\s+)/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .map((part) => titleCase(part.toLowerCase()));
}

export async function getLanguageStats(): Promise<LanguageStats> {
  const bookings = await readBookings();
  const counts = new Map<string, number>();

  for (const booking of bookings) {
    const unique = new Set(parseLanguageTokens(booking.languages ?? ""));
    for (const language of unique) {
      counts.set(language, (counts.get(language) ?? 0) + 1);
    }
  }

  const languages = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { totalBookings: bookings.length, languages };
}

export { isAdminAccessGranted as isStatsAccessGranted } from "@/lib/admin-auth";
