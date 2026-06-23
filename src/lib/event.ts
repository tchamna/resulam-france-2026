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
      event: "Conférence publique gratuite Resulam France 2026",
      date: "Dimanche 9 août 2026",
      visit: "Séjour en France : 6-11 août 2026",
      venue:
        "Lieu : Paris. Revenez sur le site pour les mises à jour — nous vous enverrons un email dès que le lieu sera annoncé.",
      siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://resulam-france-2026.azurewebsites.net",
    };
  }

  return {
    event: "Resulam France 2026 free public conference",
    date: "Sunday, August 9, 2026",
    visit: "France visit: August 6-11, 2026",
    venue:
      "Venue: Paris (exact venue to be confirmed). Check this website for updates — we will email you once the venue is announced.",
    siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://resulam-france-2026.azurewebsites.net",
  };
}
