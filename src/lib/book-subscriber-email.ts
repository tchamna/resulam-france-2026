import nodemailer from "nodemailer";
import type { BookSubscriber } from "@/lib/book-subscribers";
import { getBookSubscriberNotifyRecipients } from "@/lib/book-subscribers";
import { getSmtpConfig } from "@/lib/bookings";

const bookCoverUrl =
  "https://resulam-france-2026.azurewebsites.net/landing/une-langue-vision-du-monde-cover.png";
const amazonHardcoverUrl = "https://www.amazon.com/dp/B0HB44BHHJ";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendBookSubscriberEmails(subscriber: BookSubscriber) {
  const config = getSmtpConfig();
  if (!config) return { sentAdmin: false, sentGuest: false };

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.useTls && config.port !== 465,
    auth: { user: config.user, pass: config.pass },
  });
  const recipients = getBookSubscriberNotifyRecipients();
  const name = escapeHtml(subscriber.name);
  const location = escapeHtml(subscriber.location) || "Non renseigné";
  const email = escapeHtml(subscriber.email);

  const [admin, guest] = await Promise.allSettled([
    transporter.sendMail({
      from: config.from,
      to: recipients.join(", "),
      replyTo: subscriber.email,
      subject: `[Une langue, une vision du monde] Nouvel abonnement — ${subscriber.name}`,
      text: `Nouvel abonnement au cercle de lecteurs.\n\nNom : ${subscriber.name}\nVille et pays : ${subscriber.location}\nCourriel : ${subscriber.email}\nConsentement : oui`,
      html: `<p><strong>Nouvel abonnement au cercle de lecteurs</strong></p><p>Nom : ${name}<br>Ville et pays : ${location}<br>Courriel : ${email}<br>Consentement : oui</p>`,
    }),
    transporter.sendMail({
      from: config.from,
      to: subscriber.email,
      replyTo: recipients[0] ?? config.from,
      subject: "Votre inscription au cercle de lecteurs Resulam",
      text: `Bonjour ${subscriber.name},\n\nVotre inscription au cercle de lecteurs pour « Une langue, une vision du monde » est bien enregistrée. Vous recevrez les nouvelles de Resulam ainsi que les informations relatives au tirage de cinq exemplaires reliés.\n\nPour commander le livre en édition reliée sur Amazon :\n${amazonHardcoverUrl}\n\nResulam`,
      html: `<div style="font-family:Arial,sans-serif;color:#1e1a13;line-height:1.55;max-width:600px"><p>Bonjour ${name},</p><p>Votre inscription au cercle de lecteurs pour <strong>« Une langue, une vision du monde »</strong> est bien enregistrée.</p><p style="text-align:center"><img src="${bookCoverUrl}" alt="Couverture du livre Une langue, une vision du monde" width="240" style="display:inline-block;max-width:100%;height:auto" /></p><p>Vous recevrez les nouvelles de Resulam ainsi que les informations relatives au tirage de cinq exemplaires reliés.</p><p><a href="${amazonHardcoverUrl}" style="display:inline-block;padding:12px 18px;background:#c59a32;color:#17120a;text-decoration:none;font-weight:700">Commander l’édition reliée sur Amazon</a></p><p>Resulam</p></div>`,
    }),
  ]);

  if (admin.status === "rejected") console.error("[book-subscribers] Admin email failed", admin.reason);
  if (guest.status === "rejected") console.error("[book-subscribers] Guest email failed", guest.reason);
  return { sentAdmin: admin.status === "fulfilled", sentGuest: guest.status === "fulfilled" };
}
