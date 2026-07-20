export const DEFAULT_EVENT_DATE = "2026-08-09";
export const EVENT_TIMEZONE = "Europe/Paris";

export type EventLocale = "en" | "fr";

export function getEventDateString() {
  return process.env.EVENT_DATE?.trim() || DEFAULT_EVENT_DATE;
}

export function getParisDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIMEZONE }).format(date);
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysUntilEvent(fromDate: string, eventDate = getEventDateString()) {
  const diffMs = parseDateOnly(eventDate) - parseDateOnly(fromDate);
  return Math.round(diffMs / 86_400_000);
}

export function addDaysToDateString(date: string, days: number) {
  const base = new Date(parseDateOnly(date));
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export type ReminderPhase = "none" | "biweekly" | "daily";

export function getReminderPhase(todayParis = getParisDateString()): ReminderPhase {
  const daysUntil = daysUntilEvent(todayParis);
  if (daysUntil < 0) return "none";
  if (daysUntil >= 1 && daysUntil <= 3) return "daily";
  if (shouldSendBiweeklyReminder(todayParis)) return "biweekly";
  return "none";
}

export function shouldSendBiweeklyReminder(todayParis: string) {
  const eventDate = getEventDateString();
  const daysUntil = daysUntilEvent(todayParis, eventDate);
  if (daysUntil <= 3 || daysUntil > 30) return false;

  const startDate = addDaysToDateString(eventDate, -30);
  const daysSinceStart = daysUntilEvent(startDate, todayParis);
  if (daysSinceStart < 0) return false;
  return daysSinceStart % 14 === 0;
}

export function shouldSendReminderOnDate(todayParis = getParisDateString()) {
  return getReminderPhase(todayParis) !== "none";
}

export function getEventCopy(locale: EventLocale) {
  if (locale === "fr") {
    return {
      event: "Conférence des langues africaines avec un petit atelier sur l'alphabétisation dans les langues africaines — Resulam France 2026",
      date: "9 et 10 août 2026",
      visit: "Séjour en France : 6-11 août 2026",
      venue:
        "NDABC, 80 rue de Meaux, 75019 Paris. Métro ligne 5, station Laumière (sortie 3), 5 min à pied. Bus 48, arrêt Rue de Meaux, 5 min à pied.",
      siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://resulam-france-2026.azurewebsites.net",
    };
  }

  return {
    event: "African languages conference with a small workshop on literacy in African languages — Resulam France 2026",
    date: "August 9-10, 2026",
    visit: "France visit: August 6-11, 2026",
    venue:
      "NDABC, 80 Rue de Meaux, 75019 Paris. Metro line 5, Laumière station (exit 3), 5 min walk. Bus 48, Rue de Meaux stop, 5 min walk.",
    siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://resulam-france-2026.azurewebsites.net",
  };
}
