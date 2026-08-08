import nodemailer from "nodemailer";
import type { StoredBooking } from "@/lib/bookings";
import { getSmtpConfig } from "@/lib/bookings";

export const ATTENDANCE_CORRECTION_SUBJECT =
  "Correction — Conférence Resulam France 2026 (dimanche 9 août)";
const REPLY_TO = "contact@resulam.com";

function createTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;

  return {
    config,
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.useTls && config.port !== 465,
      auth: { user: config.user, pass: config.pass },
    }),
  };
}

function wrapHtml(body: string) {
  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f4f0e8;color:#14110d;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0e8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfd3bf;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#14110d;color:#ffffff;font-size:18px;font-weight:700;">Conférence Resulam France 2026</td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:15px;line-height:1.6;">${body}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function greeting(name: string) {
  const trimmed = name.trim();
  return trimmed ? `Bonjour ${trimmed},` : "Bonjour,";
}

function htmlBody(booking: StoredBooking) {
  return wrapHtml(`
    <p style="margin:0 0 16px;">${greeting(booking.name)}</p>
    <p style="margin:0 0 16px;">Petite correction concernant notre message précédent : la conférence aura bien lieu le <strong>dimanche 9 août 2026</strong> (et non le samedi).</p>
    <p style="margin:0 0 16px;">Merci de confirmer votre présence en répondant <strong>« Je serai présent »</strong> ou <strong>« Je serai présente »</strong> si ce n'est pas déjà fait.</p>
    <p style="margin:0 0 16px;">Si vous ne pouvez pas venir, merci de nous le signaler en répondant à ce message.</p>
    <p style="margin:0;">L'équipe d'organisation — Resulam France 2026</p>
  `);
}

function textBody(booking: StoredBooking) {
  return [
    greeting(booking.name),
    "",
    "Petite correction concernant notre message précédent : la conférence aura bien lieu le dimanche 9 août 2026 (et non le samedi).",
    "",
    "Merci de confirmer votre présence en répondant « Je serai présent » ou « Je serai présente » si ce n'est pas déjà fait.",
    "",
    "Si vous ne pouvez pas venir, merci de nous le signaler en répondant à ce message.",
    "",
    "L'équipe d'organisation — Resulam France 2026",
  ].join("\n");
}

export async function sendAttendanceCorrectionEmail(booking: StoredBooking) {
  const mail = createTransporter();
  if (!mail) {
    throw new Error("smtp_not_configured");
  }

  await mail.transporter.sendMail({
    from: mail.config.from,
    to: booking.email,
    replyTo: REPLY_TO,
    subject: ATTENDANCE_CORRECTION_SUBJECT,
    text: textBody(booking),
    html: htmlBody(booking),
  });
}
