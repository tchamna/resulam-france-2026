import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { readBookings, type StoredBooking } from "@/lib/bookings";
import { isReminderCronAuthorized } from "@/lib/booking-reminders";
import { sendVenueChangeEmail } from "@/lib/venue-change-email";

export const VENUE_NOTICE_CAMPAIGN_ID = "venue-2026-08-09-espace-barrault";

export type VenueNoticeLogEntry = {
  campaign: string;
  email: string;
  locale: StoredBooking["locale"];
  sentAt: string;
};

export type VenueNoticeRunResult = {
  ok: boolean;
  campaign: string;
  recipients: number;
  sent: number;
  alreadySent: number;
  failed: number;
  errors: string[];
};

function getNoticesFilePath() {
  const dir = process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dir, "venue-notices.jsonl");
}

async function readNoticeLog(): Promise<VenueNoticeLogEntry[]> {
  const filePath = getNoticesFilePath();
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
        return JSON.parse(line) as VenueNoticeLogEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is VenueNoticeLogEntry => Boolean(entry?.email && entry?.campaign));
}

async function logNoticeSent(entry: VenueNoticeLogEntry) {
  const filePath = getNoticesFilePath();
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

export { isReminderCronAuthorized as isVenueNoticeAuthorized };

export async function runVenueChangeNotices(
  campaign = VENUE_NOTICE_CAMPAIGN_ID,
): Promise<VenueNoticeRunResult> {
  const result: VenueNoticeRunResult = {
    ok: true,
    campaign,
    recipients: 0,
    sent: 0,
    alreadySent: 0,
    failed: 0,
    errors: [],
  };

  const [bookings, noticeLog] = await Promise.all([readBookings(), readNoticeLog()]);
  const recipients = uniqueBookingsByEmail(bookings);
  result.recipients = recipients.length;

  const sentForCampaign = new Set(
    noticeLog
      .filter((entry) => entry.campaign === campaign)
      .map((entry) => entry.email.trim().toLowerCase()),
  );

  for (const booking of recipients) {
    const email = booking.email.trim().toLowerCase();
    if (sentForCampaign.has(email)) {
      result.alreadySent += 1;
      continue;
    }

    try {
      await sendVenueChangeEmail(booking);
      await logNoticeSent({
        campaign,
        email,
        locale: booking.locale,
        sentAt: new Date().toISOString(),
      });
      sentForCampaign.add(email);
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push(
        `${email}: ${error instanceof Error ? error.message : "venue_notice_send_failed"}`,
      );
    }
  }

  result.ok = result.failed === 0;
  return result;
}
