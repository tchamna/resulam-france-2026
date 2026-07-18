import nodemailer from "nodemailer";
import type { Booking, BookingAvailability } from "@/lib/bookings";
import {
  describeMissingSmtpConfig,
  getSmtpConfig,
  parseNotifyRecipients,
} from "@/lib/bookings";
import { getEventCopy } from "@/lib/event";

function createTransporter() {
  const config = getSmtpConfig();
  if (!config) {
    const missing = describeMissingSmtpConfig();
    console.error(
      "[bookings] SMTP is not configured; confirmation emails cannot be sent",
      missing.length ? { missing } : undefined
    );
    return null;
  }

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

function eventDetails(locale: Booking["locale"]) {
  return getEventCopy(locale);
}

function seatsLine(locale: Booking["locale"], availability: BookingAvailability) {
  if (locale === "fr") {
    if (availability.remaining === 0) return "Toutes les places sont réservées.";
    if (availability.remaining === 1) return "1 place restante.";
    return `${availability.remaining} places restantes.`;
  }

  if (availability.remaining === 0) return "All places are now booked.";
  if (availability.remaining === 1) return "1 place left.";
  return `${availability.remaining} places left.`;
}

function adminSubject(booking: Booking, waitlist = false) {
  const prefix = waitlist ? "Liste d'attente" : "Nouvelle réservation";
  const prefixEn = waitlist ? "Waiting list" : "New booking";
  return booking.locale === "fr"
    ? `[Resulam France 2026] ${prefix} — ${booking.name}`
    : `[Resulam France 2026] ${prefixEn} — ${booking.name}`;
}

function guestSubject(booking: Booking, waitlist = false) {
  if (waitlist) {
    return booking.locale === "fr"
      ? "Liste d'attente — Resulam France 2026"
      : "Waiting list — Resulam France 2026";
  }

  return booking.locale === "fr"
    ? "Votre place est confirmée — Resulam France 2026"
    : "Your place is confirmed — Resulam France 2026";
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

function adminHtml(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  return wrapHtml(
    "Resulam France 2026",
    `
      <p style="margin:0 0 16px;">A new conference seat has been reserved.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#625c52;">Name</td><td style="padding:8px 0;font-weight:700;">${booking.name}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Email</td><td style="padding:8px 0;font-weight:700;">${booking.email}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Phone</td><td style="padding:8px 0;font-weight:700;">${booking.phone || "(not provided)"}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Languages</td><td style="padding:8px 0;font-weight:700;">${booking.languages}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Locale</td><td style="padding:8px 0;font-weight:700;">${booking.locale}</td></tr>
      </table>
      <p style="margin:20px 0 8px;font-weight:700;">Event</p>
      <p style="margin:0 0 4px;">${details.event}</p>
      <p style="margin:0 0 4px;">${details.date}</p>
      <p style="margin:0 0 16px;">${details.visit}</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0;padding:12px 14px;border-radius:8px;background:#fff8ea;border:1px solid #dfd3bf;">
        <strong>${availability.booked}/${availability.capacity}</strong> seats booked · ${seatsLine("en", availability)}
      </p>
    `
  );
}

function guestHtml(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  const intro =
    booking.locale === "fr"
      ? `Bonjour ${booking.name},<br><br>Votre place pour la conférence gratuite des 9 et 10 août 2026 est confirmée.`
      : `Hello ${booking.name},<br><br>Your seat for the free conference on August 9-10, 2026 is confirmed.`;

  const nextStep =
    booking.locale === "fr"
      ? "Conservez cet email. Nous vous enverrons un rappel toutes les deux semaines à partir d'un mois avant l'événement, puis chaque jour les trois derniers jours."
      : "Keep this email for your records. We will send a reminder every two weeks starting one month before the event, then daily for the final three days.";

  return wrapHtml(
    booking.locale === "fr" ? "Réservation confirmée" : "Booking confirmed",
    `
      <p style="margin:0 0 16px;">${intro}</p>
      <p style="margin:0 0 4px;font-weight:700;">${details.event}</p>
      <p style="margin:0 0 4px;">${details.date}</p>
      <p style="margin:0 0 16px;">${details.visit}</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0 0 16px;">${nextStep}</p>
      <p style="margin:0;padding:12px 14px;border-radius:8px;background:#fff8ea;border:1px solid #dfd3bf;">
        ${seatsLine(booking.locale, availability)}
      </p>
    `
  );
}

function adminText(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  return [
    "New Resulam France 2026 booking.",
    "",
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "(not provided)"}`,
    `Languages: ${booking.languages}`,
    `Locale: ${booking.locale}`,
    "",
    details.event,
    details.date,
    details.visit,
    details.venue,
    "",
    `Seats booked: ${availability.booked}/${availability.capacity}`,
    seatsLine("en", availability),
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");
}

function guestText(booking: Booking, availability: BookingAvailability, waitlist = false) {
  const details = eventDetails(booking.locale);
  const greeting = waitlist
    ? booking.locale === "fr"
      ? `Bonjour ${booking.name},\n\nVous êtes inscrit(e) sur la liste d'attente pour la conférence gratuite des 9 et 10 août 2026. Nous vous contacterons si une place se libère.`
      : `Hello ${booking.name},\n\nYou are on the waiting list for the free conference on August 9-10, 2026. We will contact you if a place opens up.`
    : booking.locale === "fr"
      ? `Bonjour ${booking.name},\n\nVotre place pour la conférence gratuite des 9 et 10 août 2026 est confirmée.`
      : `Hello ${booking.name},\n\nYour seat for the free conference on August 9-10, 2026 is confirmed.`;

  return [
    greeting,
    "",
    details.event,
    details.date,
    details.visit,
    details.venue,
    "",
    seatsLine(booking.locale, availability),
  ].join("\n");
}

function waitlistGuestHtml(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  const intro =
    booking.locale === "fr"
      ? `Bonjour ${booking.name},<br><br>Vous êtes inscrit(e) sur la liste d'attente pour la conférence gratuite des 9 et 10 août 2026. Nous vous contacterons si une personne se désiste ou change d'avis.`
      : `Hello ${booking.name},<br><br>You are on the waiting list for the free conference on August 9-10, 2026. We will contact you if someone drops out or changes their mind.`;

  return wrapHtml(
    booking.locale === "fr" ? "Liste d'attente" : "Waiting list",
    `
      <p style="margin:0 0 16px;">${intro}</p>
      <p style="margin:0 0 4px;font-weight:700;">${details.event}</p>
      <p style="margin:0 0 4px;">${details.date}</p>
      <p style="margin:0 0 16px;">${details.visit}</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0;padding:12px 14px;border-radius:8px;background:#fff8ea;border:1px solid #dfd3bf;">
        ${seatsLine(booking.locale, availability)}
      </p>
    `
  );
}

function waitlistAdminHtml(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  return wrapHtml(
    "Resulam France 2026",
    `
      <p style="margin:0 0 16px;">A new waiting-list signup was received.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#625c52;">Name</td><td style="padding:8px 0;font-weight:700;">${booking.name}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Email</td><td style="padding:8px 0;font-weight:700;">${booking.email}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Phone</td><td style="padding:8px 0;font-weight:700;">${booking.phone || "(not provided)"}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Languages</td><td style="padding:8px 0;font-weight:700;">${booking.languages}</td></tr>
        <tr><td style="padding:8px 0;color:#625c52;">Locale</td><td style="padding:8px 0;font-weight:700;">${booking.locale}</td></tr>
      </table>
      <p style="margin:20px 0 8px;font-weight:700;">Event</p>
      <p style="margin:0 0 4px;">${details.event}</p>
      <p style="margin:0 0 4px;">${details.date}</p>
      <p style="margin:0 0 16px;">${details.visit}</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0;padding:12px 14px;border-radius:8px;background:#fff8ea;border:1px solid #dfd3bf;">
        <strong>${availability.booked}/${availability.capacity}</strong> seats booked · ${seatsLine("en", availability)}
      </p>
    `
  );
}

function waitlistAdminText(booking: Booking, availability: BookingAvailability) {
  const details = eventDetails(booking.locale);
  return [
    "New Resulam France 2026 waiting-list signup.",
    "",
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "(not provided)"}`,
    `Languages: ${booking.languages}`,
    `Locale: ${booking.locale}`,
    "",
    details.event,
    details.date,
    details.visit,
    details.venue,
    "",
    `Seats booked: ${availability.booked}/${availability.capacity}`,
    seatsLine("en", availability),
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");
}

export async function sendBookingEmails(booking: Booking, availability: BookingAvailability) {
  const mail = createTransporter();
  if (!mail) return { sentAdmin: false, sentGuest: false };

  const { transporter, config } = mail;

  const notifyRecipients = parseNotifyRecipients();

  const [adminResult, guestResult] = await Promise.allSettled([
    transporter.sendMail({
      from: config.from,
      to: notifyRecipients.join(", "),
      replyTo: booking.email,
      subject: adminSubject(booking),
      text: adminText(booking, availability),
      html: adminHtml(booking, availability),
    }),
    transporter.sendMail({
      from: config.from,
      to: booking.email,
      replyTo: notifyRecipients[0] ?? config.from,
      subject: guestSubject(booking),
      text: guestText(booking, availability),
      html: guestHtml(booking, availability),
    }),
  ]);

  if (adminResult.status === "rejected") {
    console.error("[bookings] Admin email failed", adminResult.reason);
  }

  if (guestResult.status === "rejected") {
    console.error("[bookings] Guest email failed", guestResult.reason);
  }

  return {
    sentAdmin: adminResult.status === "fulfilled",
    sentGuest: guestResult.status === "fulfilled",
  };
}

export async function sendGuestBookingEmail(booking: Booking, availability: BookingAvailability) {
  const mail = createTransporter();
  if (!mail) return { sentGuest: false };

  const { transporter, config } = mail;
  const notifyRecipients = parseNotifyRecipients();

  try {
    await transporter.sendMail({
      from: config.from,
      to: booking.email,
      replyTo: notifyRecipients[0] ?? config.from,
      subject: guestSubject(booking),
      text: guestText(booking, availability),
      html: guestHtml(booking, availability),
    });

    return { sentGuest: true };
  } catch (error) {
    console.error("[bookings] Guest email failed", error);
    return { sentGuest: false };
  }
}

export async function sendWaitlistEmails(booking: Booking, availability: BookingAvailability) {
  const mail = createTransporter();
  if (!mail) return { sentAdmin: false, sentGuest: false };

  const { transporter, config } = mail;
  const notifyRecipients = parseNotifyRecipients();

  const [adminResult, guestResult] = await Promise.allSettled([
    transporter.sendMail({
      from: config.from,
      to: notifyRecipients.join(", "),
      replyTo: booking.email,
      subject: adminSubject(booking, true),
      text: waitlistAdminText(booking, availability),
      html: waitlistAdminHtml(booking, availability),
    }),
    transporter.sendMail({
      from: config.from,
      to: booking.email,
      replyTo: notifyRecipients[0] ?? config.from,
      subject: guestSubject(booking, true),
      text: guestText(booking, availability, true),
      html: waitlistGuestHtml(booking, availability),
    }),
  ]);

  if (adminResult.status === "rejected") {
    console.error("[bookings] Admin waitlist email failed", adminResult.reason);
  }

  if (guestResult.status === "rejected") {
    console.error("[bookings] Guest waitlist email failed", guestResult.reason);
  }

  return {
    sentAdmin: adminResult.status === "fulfilled",
    sentGuest: guestResult.status === "fulfilled",
  };
}

export async function sendGuestWaitlistEmail(booking: Booking, availability: BookingAvailability) {
  const mail = createTransporter();
  if (!mail) return { sentGuest: false };

  const { transporter, config } = mail;
  const notifyRecipients = parseNotifyRecipients();

  try {
    await transporter.sendMail({
      from: config.from,
      to: booking.email,
      replyTo: notifyRecipients[0] ?? config.from,
      subject: guestSubject(booking, true),
      text: guestText(booking, availability, true),
      html: waitlistGuestHtml(booking, availability),
    });

    return { sentGuest: true };
  } catch (error) {
    console.error("[bookings] Guest email failed", error);
    return { sentGuest: false };
  }
}
