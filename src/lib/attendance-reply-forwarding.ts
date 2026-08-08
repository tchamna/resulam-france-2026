import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";
import nodemailer from "nodemailer";
import { getAllowedAdminEmails } from "@/lib/admin-auth";
import { getSmtpConfig } from "@/lib/bookings";
import { ATTENDANCE_CORRECTION_SUBJECT } from "@/lib/attendance-correction-email";

const ATTENDANCE_CONFIRMATION_SUBJECT =
  "Conférence Resulam France 2026 — Confirmation de présence";
const FORWARD_SUBJECT_PREFIX = "[Réponse présence Resulam 2026]";
const CAMPAIGN_SINCE = new Date("2026-08-01T00:00:00Z");

const ATTENDANCE_SUBJECT_NEEDLES = [
  ATTENDANCE_CONFIRMATION_SUBJECT,
  ATTENDANCE_CORRECTION_SUBJECT,
  "Confirmation de présence",
  "Confirmation de presence",
];

export type AttendanceReplyForwardLogEntry = {
  messageId: string;
  from: string;
  subject: string;
  forwardedAt: string;
  adminCount: number;
};

export type AttendanceReplyForwardRunResult = {
  ok: boolean;
  scanned: number;
  matched: number;
  forwarded: number;
  alreadyForwarded: number;
  skipped: number;
  failed: number;
  adminRecipients: string[];
  errors: string[];
};

type ImapConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function readEnv(primary: string, fallback?: string) {
  const value = process.env[primary]?.trim();
  if (value) return value;
  return fallback?.trim() ?? "";
}

function normalizePassword(value: string) {
  return value.replace(/\s+/g, "");
}

export function getAttendanceReplyImapConfig(): ImapConfig | null {
  const host =
    readEnv("ATTENDANCE_REPLY_IMAP_HOST") ||
    readEnv("AUTH_IMAP_HOST") ||
    "imap.gmail.com";
  const port = Number(readEnv("ATTENDANCE_REPLY_IMAP_PORT", "993"));
  const user =
    readEnv("ATTENDANCE_REPLY_IMAP_USER") ||
    readEnv("GMAIL_USER") ||
    readEnv("AUTH_SMTP_USERNAME") ||
    readEnv("DOCUMENTPROCESSING_AUTH_SMTP_USERNAME");
  const pass = normalizePassword(
    readEnv("ATTENDANCE_REPLY_IMAP_PASSWORD") ||
      readEnv("GMAIL_PASS") ||
      readEnv("AUTH_SMTP_PASSWORD") ||
      readEnv("DOCUMENTPROCESSING_AUTH_SMTP_PASSWORD"),
  );

  if (!host || !Number.isFinite(port) || port <= 0 || !user || !pass) {
    return null;
  }

  return { host, port, user, pass };
}

function getForwardLogPath() {
  const dir = process.env.BOOKING_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dir, "attendance-reply-forwards.jsonl");
}

async function readForwardLog(): Promise<AttendanceReplyForwardLogEntry[]> {
  const filePath = getForwardLogPath();
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
        return JSON.parse(line) as AttendanceReplyForwardLogEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is AttendanceReplyForwardLogEntry => Boolean(entry?.messageId));
}

async function logForward(entry: AttendanceReplyForwardLogEntry) {
  const filePath = getForwardLogPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

function extractEmailAddress(value: string | undefined) {
  if (!value) return "";
  const match = value.match(/<([^>]+)>/);
  return normalizeEmail(match?.[1] ?? value);
}

function isReplySubject(subject: string) {
  return /^(re|ré|fwd|fw|tr)\s*:/i.test(subject.trim());
}

function matchesAttendanceCampaign(subject: string) {
  const normalized = subject.trim();
  if (normalized.startsWith(FORWARD_SUBJECT_PREFIX)) return false;
  return ATTENDANCE_SUBJECT_NEEDLES.some((needle) => normalized.includes(needle));
}

function shouldForwardReply(parsed: ParsedMail, adminEmails: Set<string>) {
  const subject = parsed.subject?.trim() ?? "";
  if (!subject || !matchesAttendanceCampaign(subject)) return false;
  if (!isReplySubject(subject) && !parsed.inReplyTo) return false;

  const from = extractEmailAddress(parsed.from?.text ?? parsed.from?.value?.[0]?.address);
  if (!from || adminEmails.has(from)) return false;

  return true;
}

function messageBody(parsed: ParsedMail) {
  if (parsed.text?.trim()) return parsed.text.trim();
  if (typeof parsed.html === "string" && parsed.html.trim()) {
    return parsed.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return "(empty body)";
}

function buildForwardText(parsed: ParsedMail) {
  const from = parsed.from?.text ?? "unknown sender";
  const subject = parsed.subject ?? "(no subject)";
  const date = parsed.date?.toISOString?.() ?? "unknown date";
  const text = messageBody(parsed);

  return [
    "Réponse de confirmation de présence reçue sur contact@resulam.com",
    "",
    `De : ${from}`,
    `Objet : ${subject}`,
    `Date : ${date}`,
    "",
    "Message :",
    text,
  ].join("\n");
}

function buildForwardHtml(parsed: ParsedMail) {
  const from = parsed.from?.text ?? "unknown sender";
  const subject = parsed.subject ?? "(no subject)";
  const date = parsed.date?.toISOString?.() ?? "unknown date";
  const text = messageBody(parsed);

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f4f0e8;color:#14110d;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0e8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dfd3bf;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#14110d;color:#ffffff;font-size:18px;font-weight:700;">Réponse de confirmation de présence</td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 12px;"><strong>De :</strong> ${from}</p>
                <p style="margin:0 0 12px;"><strong>Objet :</strong> ${subject}</p>
                <p style="margin:0 0 16px;"><strong>Date :</strong> ${date}</p>
                <p style="margin:0 0 8px;"><strong>Message :</strong></p>
                <pre style="margin:0;padding:16px;background:#f7f3ea;border:1px solid #dfd3bf;border-radius:8px;white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function forwardReplyToAdmins(parsed: ParsedMail, adminRecipients: string[]) {
  const smtp = getSmtpConfig();
  if (!smtp) throw new Error("smtp_not_configured");

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.useTls && smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  const attendeeEmail = extractEmailAddress(parsed.from?.text ?? parsed.from?.value?.[0]?.address);
  const originalSubject = parsed.subject?.trim() || "(no subject)";

  await transporter.sendMail({
    from: smtp.from,
    to: adminRecipients,
    replyTo: attendeeEmail || undefined,
    subject: `${FORWARD_SUBJECT_PREFIX} ${originalSubject}`,
    text: buildForwardText(parsed),
    html: buildForwardHtml(parsed),
  });
}

export async function runAttendanceReplyForwarding(): Promise<AttendanceReplyForwardRunResult> {
  const adminRecipients = getAllowedAdminEmails();
  const adminSet = new Set(adminRecipients);
  const result: AttendanceReplyForwardRunResult = {
    ok: true,
    scanned: 0,
    matched: 0,
    forwarded: 0,
    alreadyForwarded: 0,
    skipped: 0,
    failed: 0,
    adminRecipients,
    errors: [],
  };

  if (adminRecipients.length === 0) {
    result.ok = false;
    result.errors.push("no_admin_recipients_configured");
    return result;
  }

  const imap = getAttendanceReplyImapConfig();
  if (!imap) {
    result.ok = false;
    result.errors.push("imap_not_configured");
    return result;
  }

  const [forwardLog] = await Promise.all([readForwardLog()]);
  const forwardedIds = new Set(forwardLog.map((entry) => entry.messageId));

  const client = new ImapFlow({
    host: imap.host,
    port: imap.port,
    secure: imap.port === 993,
    auth: { user: imap.user, pass: imap.pass },
    logger: false,
  });

  await client.connect();

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = await client.search(
        {
          since: CAMPAIGN_SINCE,
          or: ATTENDANCE_SUBJECT_NEEDLES.map((needle) => ({ subject: needle })),
        },
        { uid: true },
      );

      const uidList = Array.isArray(uids) ? uids : [];
      result.scanned = uidList.length;

      for await (const message of client.fetch(
        uidList,
        { uid: true, source: true, envelope: true },
        { uid: true },
      )) {
        const messageId = message.envelope?.messageId?.trim();
        if (!messageId) {
          result.skipped += 1;
          continue;
        }

        if (forwardedIds.has(messageId)) {
          result.alreadyForwarded += 1;
          continue;
        }

        const raw = message.source;
        if (!raw) {
          result.skipped += 1;
          continue;
        }

        const parsed = await simpleParser(raw);
        if (!shouldForwardReply(parsed, adminSet)) {
          result.skipped += 1;
          continue;
        }

        result.matched += 1;

        try {
          await forwardReplyToAdmins(parsed, adminRecipients);
          await logForward({
            messageId,
            from: extractEmailAddress(parsed.from?.text ?? parsed.from?.value?.[0]?.address),
            subject: parsed.subject?.trim() ?? "",
            forwardedAt: new Date().toISOString(),
            adminCount: adminRecipients.length,
          });
          forwardedIds.add(messageId);
          result.forwarded += 1;
        } catch (error) {
          result.failed += 1;
          result.errors.push(
            `${messageId}: ${error instanceof Error ? error.message : "attendance_reply_forward_failed"}`,
          );
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  result.ok = result.failed === 0;
  return result;
}
