import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { readBookings, type StoredBooking } from "@/lib/bookings";
import { sendReminderEmail } from "@/lib/reminder-email";
import {
  getParisDateString,
  getReminderPhase,
  shouldSendReminderOnDate,
  type ReminderPhase,
} from "@/lib/event";

export type ReminderLogEntry = {
  email: string;
  date: string;
  phase: ReminderPhase;
  sentAt: string;
};

export type ReminderRunResult = {
  ok: boolean;
  today: string;
  phase: ReminderPhase;
  eligible: boolean;
  sent: number;
  alreadySent: number;
  failed: number;
  errors: string[];
};

function getRemindersFilePath() {
  const dir = process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dir, "reminders.jsonl");
}

async function readReminderLog(): Promise<ReminderLogEntry[]> {
  const filePath = getRemindersFilePath();
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
        return JSON.parse(line) as ReminderLogEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is ReminderLogEntry => Boolean(entry?.email && entry?.date));
}

async function logReminderSent(entry: ReminderLogEntry) {
  const filePath = getRemindersFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

function uniqueBookingsByEmail(bookings: StoredBooking[]) {
  const latest = new Map<string, StoredBooking>();
  for (const booking of bookings) {
    const key = booking.email.trim().toLowerCase();
    const existing = latest.get(key);
    if (!existing || booking.createdAt > existing.createdAt) {
      latest.set(key, booking);
    }
  }
  return [...latest.values()];
}

export function isReminderCronAuthorized(request: Request) {
  const expected =
    process.env.BOOKING_REMINDER_CRON_KEY?.trim() ||
    process.env.BOOKING_STATS_KEY?.trim() ||
    "";

  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("authorization")?.trim();
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim() === expected;
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  return Boolean(key && key === expected);
}

export async function runBookingReminders(todayParis = getParisDateString()): Promise<ReminderRunResult> {
  const phase = getReminderPhase(todayParis);
  const result: ReminderRunResult = {
    ok: true,
    today: todayParis,
    phase,
    eligible: shouldSendReminderOnDate(todayParis),
    sent: 0,
    alreadySent: 0,
    failed: 0,
    errors: [],
  };

  if (!result.eligible) {
    return result;
  }

  const [bookings, reminderLog] = await Promise.all([readBookings(), readReminderLog()]);
  const sentToday = new Set(
    reminderLog.filter((entry) => entry.date === todayParis).map((entry) => entry.email.toLowerCase()),
  );

  for (const booking of uniqueBookingsByEmail(bookings)) {
    const email = booking.email.trim().toLowerCase();
    if (sentToday.has(email)) {
      result.alreadySent += 1;
      continue;
    }

    try {
      await sendReminderEmail(booking, phase, todayParis);
      await logReminderSent({
        email,
        date: todayParis,
        phase,
        sentAt: new Date().toISOString(),
      });
      sentToday.add(email);
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push(
        `${email}: ${error instanceof Error ? error.message : "reminder_send_failed"}`,
      );
    }
  }

  result.ok = result.failed === 0;
  return result;
}
