import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";
import {
  getGroup1Capacity,
  isFullyBooked,
  normalizeBookingAvailability,
} from "@/lib/booking-availability";

export type Booking = {
  locale: "en" | "fr";
  name: string;
  email: string;
  phone: string;
  languages: string;
};

export type StoredBooking = Booking & {
  createdAt: string;
  waitlist?: boolean;
};

export type BookingAvailability = {
  capacity: number;
  group1Capacity: number;
  booked: number;
  remaining: number;
  full: boolean;
  waitlistCount: number;
};

export function getBookingCapacity() {
  const parsed = Number(process.env.BOOKING_CAPACITY ?? "50");
  if (!Number.isFinite(parsed) || parsed < 1) return 50;
  return Math.floor(parsed);
}

/** Dev/preview only: force sold-out UI without changing real booking data. */
export function isBookingForceSoldOut() {
  return process.env.BOOKING_FORCE_SOLD_OUT?.trim().toLowerCase() === "true";
}

export function getForcedSoldOutAvailability(): BookingAvailability {
  const capacity = getBookingCapacity();
  return {
    capacity,
    group1Capacity: getGroup1Capacity(),
    booked: capacity,
    remaining: 0,
    full: true,
    waitlistCount: 0,
  };
}

/** Dev/preview only: override waitlist count shown when sold out. */
function getForcedWaitlistCount() {
  const raw = process.env.BOOKING_FORCE_WAITLIST_COUNT?.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

async function getWaitlistCount() {
  const forced = getForcedWaitlistCount();
  if (forced !== null) return forced;
  return (await readBookings()).filter((entry) => entry.waitlist).length;
}

export function getBookingDataDir() {
  return process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
}

export function getBookingsFilePath() {
  return path.join(getBookingDataDir(), "bookings.jsonl");
}

function getBookingAvailabilitySourceUrl() {
  return process.env.BOOKING_AVAILABILITY_SOURCE_URL?.trim() || "";
}

function isBookingAvailability(value: unknown): value is BookingAvailability {
  if (!value || typeof value !== "object") return false;
  const availability = value as Partial<BookingAvailability>;
  return (
    Number.isFinite(availability.capacity) &&
    Number.isFinite(availability.booked) &&
    Number.isFinite(availability.remaining) &&
    typeof availability.full === "boolean"
  );
}

async function readRemoteBookingAvailability(): Promise<BookingAvailability | null> {
  const url = getBookingAvailabilitySourceUrl();
  if (!url) return null;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!isBookingAvailability(data)) return null;
    const capacity = getBookingCapacity();
    const booked = Math.max(Math.floor(data.booked), 0);
    const remaining = Math.max(capacity - booked, 0);
    return {
      capacity,
      group1Capacity: getGroup1Capacity(),
      booked,
      remaining,
      full: isFullyBooked(remaining),
      waitlistCount: 0,
    };
  } catch (error) {
    console.error("[bookings] Failed to read remote availability", error);
    return null;
  }
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

export function isConfirmedBooking(entry: StoredBooking) {
  return !entry.waitlist;
}

export function getDefaultAvailability(): BookingAvailability {
  const capacity = getBookingCapacity();
  return {
    capacity,
    group1Capacity: getGroup1Capacity(),
    booked: 0,
    remaining: capacity,
    full: false,
    waitlistCount: 0,
  };
}

export async function getBookingAvailability(): Promise<BookingAvailability> {
  try {
    const waitlistCount = await getWaitlistCount();

    if (isBookingForceSoldOut()) {
      return normalizeBookingAvailability({
        ...getForcedSoldOutAvailability(),
        waitlistCount,
      });
    }

    const remoteAvailability = await readRemoteBookingAvailability();
    if (remoteAvailability) {
      return normalizeBookingAvailability({ ...remoteAvailability, waitlistCount });
    }

    const capacity = getBookingCapacity();
    const group1Capacity = getGroup1Capacity();
    const booked = (await readBookings()).filter(isConfirmedBooking).length;
    const remaining = Math.max(capacity - booked, 0);
    return normalizeBookingAvailability({
      capacity,
      group1Capacity,
      booked,
      remaining,
      full: isFullyBooked(remaining),
      waitlistCount,
    });
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

export async function saveBooking(booking: Booking, options?: { waitlist?: boolean }) {
  const dir = getBookingDataDir();
  await mkdir(dir, { recursive: true });
  await appendFile(
    getBookingsFilePath(),
    `${JSON.stringify({
      ...booking,
      waitlist: options?.waitlist ?? false,
      createdAt: new Date().toISOString(),
    })}\n`,
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

function readSmtpEnv(primary: string, fallback: string) {
  return process.env[primary]?.trim() || process.env[fallback]?.trim() || "";
}

function normalizeSmtpPassword(value: string) {
  // Gmail app passwords are 16 chars; Google often displays them in groups of four.
  return value.replace(/\s+/g, "");
}

export function describeMissingSmtpConfig() {
  const host = readSmtpEnv("AUTH_SMTP_HOST", "DOCUMENTPROCESSING_AUTH_SMTP_HOST");
  const portRaw = readSmtpEnv("AUTH_SMTP_PORT", "DOCUMENTPROCESSING_AUTH_SMTP_PORT");
  const port = Number(portRaw || "0");
  const user = readSmtpEnv("AUTH_SMTP_USERNAME", "DOCUMENTPROCESSING_AUTH_SMTP_USERNAME");
  const pass = readSmtpEnv("AUTH_SMTP_PASSWORD", "DOCUMENTPROCESSING_AUTH_SMTP_PASSWORD");
  const from =
    readSmtpEnv("AUTH_SMTP_FROM", "DOCUMENTPROCESSING_AUTH_SMTP_FROM") || user;
  const missing: string[] = [];

  if (!host) missing.push("AUTH_SMTP_HOST");
  if (!portRaw || !Number.isFinite(port) || port <= 0) missing.push("AUTH_SMTP_PORT");
  if (!user) missing.push("AUTH_SMTP_USERNAME");
  if (!pass) missing.push("AUTH_SMTP_PASSWORD");
  if (!from) missing.push("AUTH_SMTP_FROM (or AUTH_SMTP_USERNAME)");

  return missing;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = readSmtpEnv("AUTH_SMTP_HOST", "DOCUMENTPROCESSING_AUTH_SMTP_HOST");
  const port = Number(
    process.env.AUTH_SMTP_PORT ?? process.env.DOCUMENTPROCESSING_AUTH_SMTP_PORT ?? "0"
  );
  const user = readSmtpEnv("AUTH_SMTP_USERNAME", "DOCUMENTPROCESSING_AUTH_SMTP_USERNAME");
  const pass = normalizeSmtpPassword(
    readSmtpEnv("AUTH_SMTP_PASSWORD", "DOCUMENTPROCESSING_AUTH_SMTP_PASSWORD")
  );
  const from =
    readSmtpEnv("AUTH_SMTP_FROM", "DOCUMENTPROCESSING_AUTH_SMTP_FROM") || user;
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
