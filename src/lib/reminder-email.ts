import nodemailer from "nodemailer";
import type { StoredBooking } from "@/lib/bookings";
import { getSmtpConfig, parseNotifyRecipients } from "@/lib/bookings";
import {
  daysUntilEvent,
  getEventCopy,
  type ReminderPhase,
} from "@/lib/event";

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

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f0e8;color:#14110d;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0e8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfd3bf;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#14110d;color:#ffffff;font-size:18px;font-weight:700;">${title}</td>
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

function countdownLine(locale: StoredBooking["locale"], daysLeft: number) {
  if (locale === "fr") {
    if (daysLeft === 0) return "C'est aujourd'hui — à tout à l'heure !";
    if (daysLeft === 1) return "Il reste 1 jour avant la conférence.";
    return `Il reste ${daysLeft} jours avant la conférence.`;
  }

  if (daysLeft === 0) return "It's today — see you soon!";
  if (daysLeft === 1) return "1 day left until the conference.";
  return `${daysLeft} days left until the conference.`;
}

function reminderSubject(booking: StoredBooking, phase: ReminderPhase, daysLeft: number) {
  if (booking.locale === "fr") {
    if (phase === "daily" && daysLeft <= 1) {
      return daysLeft === 0
        ? "Aujourd'hui — Conférence Resulam France 2026"
        : "Demain — Conférence Resulam France 2026";
    }
    return "Rappel — Conférence Resulam France 2026 (9-10 août)";
  }

  if (phase === "daily" && daysLeft <= 1) {
    return daysLeft === 0
      ? "Today — Resulam France 2026 conference"
      : "Tomorrow — Resulam France 2026 conference";
  }
  return "Reminder — Resulam France 2026 conference (August 9-10)";
}

function reminderHtml(booking: StoredBooking, phase: ReminderPhase, todayParis: string) {
  const details = getEventCopy(booking.locale);
  const daysLeft = daysUntilEvent(todayParis);
  const intro =
    booking.locale === "fr"
      ? `Bonjour ${booking.name},<br><br>Petit rappel concernant votre place pour la conférence gratuite Resulam France 2026.`
      : `Hello ${booking.name},<br><br>This is a friendly reminder about your seat for the free Resulam France 2026 conference.`;

  const scheduleNote =
    booking.locale === "fr"
      ? "Nous vous enverrons un rappel toutes les deux semaines jusqu'à trois jours avant l'événement, puis chaque jour les trois derniers jours."
      : "We will send a reminder every two weeks until three days before the event, then daily for the final three days.";

  const phaseNote =
    phase === "daily"
      ? countdownLine(booking.locale, daysLeft)
      : booking.locale === "fr"
        ? "La conférence approche — notez la date dans votre agenda."
        : "The conference is coming up — please save the date.";

  return wrapHtml(
    booking.locale === "fr" ? "Rappel conférence" : "Conference reminder",
    `
      <p style="margin:0 0 16px;">${intro}</p>
      <p style="margin:0 0 12px;font-weight:700;">${phaseNote}</p>
      <p style="margin:0 0 4px;font-weight:700;">${details.event}</p>
      <p style="margin:0 0 4px;">${details.date}</p>
      <p style="margin:0 0 16px;">${details.visit}</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0 0 16px;">
        <a href="${details.siteUrl}" style="color:#2f6b45;font-weight:700;">${details.siteUrl}</a>
      </p>
      <p style="margin:0;padding:12px 14px;border-radius:8px;background:#fff8ea;border:1px solid #dfd3bf;">
        ${scheduleNote}
      </p>
    `,
  );
}

function reminderText(booking: StoredBooking, phase: ReminderPhase, todayParis: string) {
  const details = getEventCopy(booking.locale);
  const daysLeft = daysUntilEvent(todayParis);
  const greeting =
    booking.locale === "fr"
      ? `Bonjour ${booking.name},\n\nPetit rappel concernant votre place pour la conférence gratuite Resulam France 2026.`
      : `Hello ${booking.name},\n\nThis is a friendly reminder about your seat for the free Resulam France 2026 conference.`;

  const phaseNote =
    phase === "daily"
      ? countdownLine(booking.locale, daysLeft)
      : booking.locale === "fr"
        ? "La conférence approche — notez la date dans votre agenda."
        : "The conference is coming up — please save the date.";

  return [
    greeting,
    "",
    phaseNote,
    "",
    details.event,
    details.date,
    details.visit,
    details.venue,
    "",
    details.siteUrl,
  ].join("\n");
}

export async function sendReminderEmail(
  booking: StoredBooking,
  phase: ReminderPhase,
  todayParis: string,
) {
  const mail = createTransporter();
  if (!mail) {
    throw new Error("SMTP is not configured");
  }

  const daysLeft = daysUntilEvent(todayParis);
  const { transporter, config } = mail;

  await transporter.sendMail({
    from: config.from,
    to: booking.email,
    replyTo: parseNotifyRecipients()[0] ?? config.from,
    subject: reminderSubject(booking, phase, daysLeft),
    text: reminderText(booking, phase, todayParis),
    html: reminderHtml(booking, phase, todayParis),
  });
}
