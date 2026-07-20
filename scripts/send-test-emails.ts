/**
 * One-off script to send sample booking/reminder emails for visual QA.
 * Usage: npx tsx scripts/send-test-emails.ts [recipient@email.com]
 */
import nodemailer from "nodemailer";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const TEST_EMAIL = process.argv[2]?.trim() || "tchamna@gmail.com";

const originalCreateTransport = nodemailer.createTransport.bind(nodemailer);
nodemailer.createTransport = (...args: Parameters<typeof nodemailer.createTransport>) => {
  const transport = originalCreateTransport(...args);
  const originalSendMail = transport.sendMail.bind(transport);
  transport.sendMail = async (mailOptions) => {
    const subject =
      typeof mailOptions.subject === "string" && !mailOptions.subject.startsWith("[TEST]")
        ? `[TEST] ${mailOptions.subject}`
        : mailOptions.subject;
    return originalSendMail({ ...mailOptions, to: TEST_EMAIL, subject });
  };
  return transport;
};

type Result = { label: string; ok: boolean; error?: string };

async function runCase(label: string, fn: () => Promise<{ sentGuest?: boolean }>) {
  try {
    const result = await fn();
    const ok = result.sentGuest !== false;
    return { label, ok, ...(ok ? {} : { error: "send returned sentGuest=false" }) };
  } catch (error) {
    return { label, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const { describeMissingSmtpConfig } = await import("../src/lib/bookings");
  const missing = describeMissingSmtpConfig();
  if (missing.length) {
    console.error("SMTP not configured. Missing:", missing.join(", "));
    process.exit(1);
  }

  const { sendGuestBookingEmail, sendGuestWaitlistEmail } = await import(
    "../src/lib/booking-email"
  );
  const { sendReminderEmail } = await import("../src/lib/reminder-email");

  const booking = {
    locale: "fr" as const,
    name: "Marie Dupont",
    email: "marie.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    languages: "Français, Nufi",
  };

  const storedBooking = {
    ...booking,
    createdAt: new Date().toISOString(),
  };

  const results: Result[] = [];

  results.push(
    await runCase("Groupe 2 confirmation (49 remaining)", () =>
      sendGuestBookingEmail(booking, {
        capacity: 100,
        group1Capacity: 50,
        booked: 51,
        remaining: 49,
        full: false,
        waitlistCount: 0,
      }),
    ),
  );

  results.push(
    await runCase("Groupe 1 confirmation", () =>
      sendGuestBookingEmail(booking, {
        capacity: 100,
        group1Capacity: 50,
        booked: 25,
        remaining: 25,
        full: false,
        waitlistCount: 0,
      }),
    ),
  );

  results.push(
    await runCase("Waitlist", () =>
      sendGuestWaitlistEmail(booking, {
        capacity: 100,
        group1Capacity: 50,
        booked: 100,
        remaining: 0,
        full: true,
        waitlistCount: 3,
      }),
    ),
  );

  results.push(
    await runCase("Reminder biweekly", async () => {
      await sendReminderEmail(storedBooking, "biweekly", "2026-07-10");
      return { sentGuest: true };
    }),
  );

  results.push(
    await runCase("Reminder daily (J-1)", async () => {
      await sendReminderEmail(storedBooking, "daily", "2026-08-08");
      return { sentGuest: true };
    }),
  );

  const sent = results.filter((r) => r.ok).length;
  console.log(JSON.stringify({ recipient: TEST_EMAIL, sent, total: results.length, results }, null, 2));

  if (sent < results.length) process.exit(1);
}

main();
