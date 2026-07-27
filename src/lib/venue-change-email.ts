import nodemailer from "nodemailer";
import type { StoredBooking } from "@/lib/bookings";
import { getSmtpConfig } from "@/lib/bookings";
import { getEventCopy } from "@/lib/event";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=98+rue+Barrault%2C+75013+Paris";

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

function subject(booking: StoredBooking) {
  return booking.locale === "fr"
    ? "Mise à jour du lieu — conférence du 9 août — Resulam France 2026"
    : "Venue update — August 9 conference — Resulam France 2026";
}

function htmlBody(booking: StoredBooking) {
  const details = getEventCopy(booking.locale);
  const siteLink = `<a href="${details.siteUrl}" style="color:#2f6b45;font-weight:700;">${details.siteUrl}</a>`;
  const mapsLink = `<a href="${MAPS_URL}" style="color:#2f6b45;font-weight:700;">Google Maps</a>`;

  if (booking.locale === "fr") {
    return wrapHtml(
      "Nouveau lieu — 9 août 2026",
      `
      <p style="margin:0 0 16px;">Bonjour ${booking.name},</p>
      <p style="margin:0 0 16px;">
        L'adresse de la <strong>conférence du 9 août 2026</strong> (14h–18h) a changé.
        Votre réservation reste valide.
      </p>
      <p style="margin:0 0 16px;">
        Nous avons choisi ce nouveau lieu pour que vous viviez la <strong>meilleure expérience possible</strong>
        — plus d'espace, plus de confort, et des conditions idéales pour partager nos langues maternelles ensemble.
      </p>
      <p style="margin:0 0 8px;font-weight:700;">Ancien lieu (9 août)</p>
      <p style="margin:0 0 16px;">NDABC, 80 rue de Meaux, 75019 Paris</p>
      <p style="margin:0 0 8px;font-weight:700;">Nouveau lieu (9 août)</p>
      <p style="margin:0 0 16px;"><strong>Espace Barrault</strong><br>98 rue Barrault, 75013 Paris</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0 0 16px;">${mapsLink}</p>
      <p style="margin:0 0 16px;">
        La rencontre du <strong>10 août</strong> (9h–12h) reste au même endroit :
        TAMERY SEMATAWY, Librairie Kamite Panafricaine, 15-17-19 rue du Chalet, 75010 Paris.
      </p>
      <p style="margin:0;">Détails sur le site : ${siteLink}</p>
    `,
    );
  }

  return wrapHtml(
    "New venue — August 9, 2026",
    `
      <p style="margin:0 0 16px;">Hello ${booking.name},</p>
      <p style="margin:0 0 16px;">
        The venue for the <strong>August 9, 2026</strong> conference (2pm–6pm) has changed.
        Your reservation is still valid.
      </p>
      <p style="margin:0 0 16px;">
        We moved to this new space because we want you to have the <strong>best experience ever</strong>
        — more room, more comfort, and the right setting to celebrate our mother tongues together.
      </p>
      <p style="margin:0 0 8px;font-weight:700;">Previous venue (August 9)</p>
      <p style="margin:0 0 16px;">NDABC, 80 rue de Meaux, 75019 Paris</p>
      <p style="margin:0 0 8px;font-weight:700;">New venue (August 9)</p>
      <p style="margin:0 0 16px;"><strong>Espace Barrault</strong><br>98 rue Barrault, 75013 Paris</p>
      <p style="margin:0 0 16px;">${details.venue}</p>
      <p style="margin:0 0 16px;">${mapsLink}</p>
      <p style="margin:0 0 16px;">
        The <strong>August 10</strong> session (9am–12pm) is unchanged:
        TAMERY SEMATAWY, Librairie Kamite Panafricaine, 15-17-19 rue du Chalet, 75010 Paris.
      </p>
      <p style="margin:0;">Full details: ${siteLink}</p>
    `,
  );
}

function textBody(booking: StoredBooking) {
  const details = getEventCopy(booking.locale);

  if (booking.locale === "fr") {
    return [
      `Bonjour ${booking.name},`,
      "",
      "L'adresse de la conférence du 9 août 2026 (14h–18h) a changé. Votre réservation reste valide.",
      "",
      "Nous avons choisi ce nouveau lieu pour que vous viviez la meilleure expérience possible — plus d'espace, plus de confort, et des conditions idéales pour partager nos langues maternelles ensemble.",
      "",
      "Ancien lieu (9 août) : NDABC, 80 rue de Meaux, 75019 Paris",
      "Nouveau lieu (9 août) : Espace Barrault, 98 rue Barrault, 75013 Paris",
      "",
      details.venue,
      MAPS_URL,
      "",
      "La rencontre du 10 août (9h–12h) reste au même endroit : TAMERY SEMATAWY, Librairie Kamite Panafricaine, 15-17-19 rue du Chalet, 75010 Paris.",
      "",
      details.siteUrl,
    ].join("\n");
  }

  return [
    `Hello ${booking.name},`,
    "",
    "The venue for the August 9, 2026 conference (2pm–6pm) has changed. Your reservation is still valid.",
    "",
    "We moved to this new space because we want you to have the best experience ever — more room, more comfort, and the right setting to celebrate our mother tongues together.",
    "",
    "Previous venue (August 9): NDABC, 80 rue de Meaux, 75019 Paris",
    "New venue (August 9): Espace Barrault, 98 rue Barrault, 75013 Paris",
    "",
    details.venue,
    MAPS_URL,
    "",
    "The August 10 session (9am–12pm) is unchanged: TAMERY SEMATAWY, Librairie Kamite Panafricaine, 15-17-19 rue du Chalet, 75010 Paris.",
    "",
    details.siteUrl,
  ].join("\n");
}

export async function sendVenueChangeEmail(booking: StoredBooking) {
  const mail = createTransporter();
  if (!mail) {
    throw new Error("smtp_not_configured");
  }

  await mail.transporter.sendMail({
    from: mail.config.from,
    to: booking.email,
    subject: subject(booking),
    text: textBody(booking),
    html: htmlBody(booking),
  });
}
