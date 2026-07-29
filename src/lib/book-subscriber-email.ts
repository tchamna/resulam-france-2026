import nodemailer from "nodemailer";
import type { BookSubscriber } from "@/lib/book-subscribers";
import { getBookSubscriberNotifyRecipients } from "@/lib/book-subscribers";
import { getSmtpConfig } from "@/lib/bookings";

function escapeHtml(value: string) {
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
  const email = escapeHtml(subscriber.email);

  const [admin, guest] = await Promise.allSettled([
    transporter.sendMail({
      from: config.from,
      to: recipients.join(", "),
      replyTo: subscriber.email,
      subject: `[Une langue, une vision du monde] Nouvel abonnement — ${subscriber.name}`,
      text: `Nouvel abonnement au cercle de lecteurs.\n\nNom : ${subscriber.name}\nCourriel : ${subscriber.email}\nConsentement : oui`,
      html: `<p><strong>Nouvel abonnement au cercle de lecteurs</strong></p><p>Nom : ${name}<br>Courriel : ${email}<br>Consentement : oui</p>`,
    }),
    transporter.sendMail({
      from: config.from,
      to: subscriber.email,
      replyTo: recipients[0] ?? config.from,
      subject: "Votre inscription au cercle de lecteurs Resulam",
      text: `Bonjour ${subscriber.name},\n\nVotre inscription au cercle de lecteurs pour « Une langue, une vision du monde » est bien enregistrée. Vous recevrez les nouvelles de Resulam ainsi que les informations relatives au tirage de cinq exemplaires reliés.\n\nResulam`,
      html: `<p>Bonjour ${name},</p><p>Votre inscription au cercle de lecteurs pour <strong>« Une langue, une vision du monde »</strong> est bien enregistrée.</p><p>Vous recevrez les nouvelles de Resulam ainsi que les informations relatives au tirage de cinq exemplaires reliés.</p><p>Resulam</p>`,
    }),
  ]);

  if (admin.status === "rejected") console.error("[book-subscribers] Admin email failed", admin.reason);
  if (guest.status === "rejected") console.error("[book-subscribers] Guest email failed", guest.reason);
  return { sentAdmin: admin.status === "fulfilled", sentGuest: guest.status === "fulfilled" };
}
