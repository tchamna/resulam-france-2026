import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Booking = {
  locale: "en" | "fr";
  name: string;
  email: string;
  phone: string;
  languages: string;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function parseRecipients() {
  return (process.env.BOOKING_NOTIFY_EMAILS ?? "contact@resulam.com")
    .split(/[,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function getSmtpConfig() {
  const host = process.env.AUTH_SMTP_HOST?.trim();
  const port = Number(process.env.AUTH_SMTP_PORT ?? "0");
  const user = process.env.AUTH_SMTP_USERNAME?.trim();
  const pass = process.env.AUTH_SMTP_PASSWORD?.trim();
  const from = process.env.AUTH_SMTP_FROM?.trim() || user;

  if (!host || !port || !user || !pass || !from) return null;
  return { host, port, user, pass, from };
}

function validate(body: Record<string, unknown>): Booking | null {
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

async function saveBooking(booking: Booking) {
  const dir = process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "bookings.jsonl"),
    `${JSON.stringify({ ...booking, createdAt: new Date().toISOString() })}\n`,
    "utf8"
  );
}

async function sendNotification(booking: Booking) {
  const config = getSmtpConfig();
  if (!config) return false;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: config.from,
    to: parseRecipients().join(", "),
    replyTo: booking.email,
    subject: `[Resulam France 2026] Booking request from ${booking.name}`,
    text: [
      "New Resulam France 2026 booking request.",
      "",
      `Name: ${booking.name}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone || "(not provided)"}`,
      `African languages of interest: ${booking.languages}`,
      `Language: ${booking.locale}`,
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n"),
  });

  return true;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const booking = validate((raw ?? {}) as Record<string, unknown>);
  if (!booking) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }

  try {
    await saveBooking(booking);
    await sendNotification(booking);
  } catch (error) {
    console.error("[bookings] Failed to save or notify", error);
    return NextResponse.json({ error: "Booking could not be saved" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
