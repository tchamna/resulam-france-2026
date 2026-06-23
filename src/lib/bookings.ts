import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

export type Booking = {
  locale: "en" | "fr";
  name: string;
  email: string;
  phone: string;
  languages: string;
};

export type StoredBooking = Booking & {
  createdAt: string;
};

export type BookingAvailability = {
  capacity: number;
  booked: number;
  remaining: number;
  full: boolean;
};

export function getBookingCapacity() {
  const parsed = Number(process.env.BOOKING_CAPACITY ?? "50");
  if (!Number.isFinite(parsed) || parsed < 1) return 50;
  return Math.floor(parsed);
}

export function getBookingDataDir() {
  return process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
}

export function getBookingsFilePath() {
  return path.join(getBookingDataDir(), "bookings.jsonl");
}

export async function readBookings(): Promise<StoredBooking[]> {
  const filePath = getBookingsFilePath();
  let raw = "";
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as StoredBooking;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is StoredBooking => Boolean(entry?.email));
}

export function getDefaultAvailability(): BookingAvailability {
  const capacity = getBookingCapacity();
  return { capacity, booked: 0, remaining: capacity, full: false };
}

export async function getBookingAvailability(): Promise<BookingAvailability> {
  try {
    const capacity = getBookingCapacity();
    const booked = (await readBookings()).length;
    const remaining = Math.max(capacity - booked, 0);
    return { capacity, booked, remaining, full: remaining === 0 };
  } catch (error) {
    console.error("[bookings] Failed to read availability", error);
    return getDefaultAvailability();
  }
}

export async function findBookingByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const bookings = await readBookings();
  return bookings.find((entry) => entry.email.toLowerCase() === normalized) ?? null;
}

export async function saveBooking(booking: Booking) {
  const dir = getBookingDataDir();
  await mkdir(dir, { recursive: true });
  await appendFile(
    getBookingsFilePath(),
    `${JSON.stringify({ ...booking, createdAt: new Date().toISOString() })}\n`,
    "utf8"
  );
}

export function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function validateBooking(body: Record<string, unknown>): Booking | null {
  const locale = body.locale === "fr" ? "fr" : "en";
  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 60);
  const languages = clean(body.languages, 500);

  if (name.length < 2) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (languages.length < 2) return null;
  return { locale, name, email, phone, languages };
}

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  useTls: boolean;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host =
    process.env.AUTH_SMTP_HOST?.trim() || process.env.DOCUMENTPROCESSING_AUTH_SMTP_HOST?.trim();
  const port = Number(
    process.env.AUTH_SMTP_PORT ?? process.env.DOCUMENTPROCESSING_AUTH_SMTP_PORT ?? "0"
  );
  const user =
    process.env.AUTH_SMTP_USERNAME?.trim() ||
    process.env.DOCUMENTPROCESSING_AUTH_SMTP_USERNAME?.trim();
  const pass =
    process.env.AUTH_SMTP_PASSWORD?.trim() ||
    process.env.DOCUMENTPROCESSING_AUTH_SMTP_PASSWORD?.trim();
  const from =
    process.env.AUTH_SMTP_FROM?.trim() ||
    process.env.DOCUMENTPROCESSING_AUTH_SMTP_FROM?.trim() ||
    user;
  const useTls =
    (process.env.AUTH_SMTP_USE_TLS ?? process.env.DOCUMENTPROCESSING_AUTH_SMTP_USE_TLS ?? "true")
      .toLowerCase()
      .trim() !== "false";

  if (!host || !port || !user || !pass || !from) return null;
  return { host, port, user, pass, from, useTls };
}

export function parseNotifyRecipients() {
  return (process.env.BOOKING_NOTIFY_EMAILS ?? "contact@resulam.com")
    .split(/[,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}
