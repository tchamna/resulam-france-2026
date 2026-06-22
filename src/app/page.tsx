import Image from "next/image";
import { headers } from "next/headers";
import { BookingForm } from "@/components/BookingForm";

const content = {
  en: {
    navLanguage: "English",
    eyebrow: "France visit: August 6-11, 2026",
    title: "Resulam France 2026",
    lead:
      "Join us for a free conference on August 9 to help families reconnect with their mother tongue and pass it on with confidence.",
    cta: "Book a free place",
    limit: "Free to attend. Places are limited, so booking is required.",
    dateLabel: "Conference",
    dateValue: "Sunday, August 9, 2026",
    visitLabel: "Resulam in France",
    visitValue: "August 6-11, 2026",
    costLabel: "Cost",
    costValue: "Free entry",
    sectionTitle: "A practical day for families and adults",
    sectionText:
      "The page stays simple because the message is simple: come, learn what is possible, and leave with tools you can use immediately.",
    benefits: [
      "How to teach African languages to your children at home",
      "How adults can start learning even if they missed the chance in childhood",
      "Books for learning African languages",
      "Applications and digital tools",
      "USB drives containing learning videos",
      "More surprises for participants",
    ],
    form: {
      title: "Reserve your place",
      intro: "We only need a few details to hold your seat.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      optional: "optional",
      button: "Reserve now",
      sending: "Sending...",
      success: "Your booking request has been received.",
      error: "We could not submit your booking. Please try again.",
    },
    footer: "Resulam France 2026",
  },
  fr: {
    navLanguage: "Français",
    eyebrow: "Séjour en France : 6-11 août 2026",
    title: "Resulam France 2026",
    lead:
      "Participez gratuitement à la grande conférence du 9 août pour aider les familles à retrouver leur langue maternelle et à la transmettre avec assurance.",
    cta: "Réserver gratuitement",
    limit: "L'entrée est gratuite. Les places sont limitées, la réservation est obligatoire.",
    dateLabel: "Conference",
    dateValue: "Dimanche 9 août 2026",
    visitLabel: "Resulam en France",
    visitValue: "6-11 août 2026",
    costLabel: "Tarif",
    costValue: "Entrée gratuite",
    sectionTitle: "Une journée pratique pour les familles et les adultes",
    sectionText:
      "La page reste simple parce que le message est simple : venez, découvrez ce qui est possible, et repartez avec des outils utiles tout de suite.",
    benefits: [
      "Comment enseigner les langues africaines à vos enfants à la maison",
      "Comment les adultes peuvent commencer même sans avoir appris dans l'enfance",
      "Des livres pour apprendre les langues africaines",
      "Des applications et outils numériques",
      "Des clés USB contenant des vidéos d'apprentissage",
      "Et beaucoup d'autres surprises",
    ],
    form: {
      title: "Réserver votre place",
      intro: "Quelques informations suffisent pour garder votre place.",
      name: "Nom",
      email: "Email",
      phone: "Téléphone",
      optional: "facultatif",
      button: "Réserver",
      sending: "Envoi...",
      success: "Votre demande de réservation a été reçue.",
      error: "Impossible d'envoyer votre réservation. Veuillez réessayer.",
    },
    footer: "Resulam France 2026",
  },
};

async function getLocale(): Promise<"en" | "fr"> {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export default async function Page() {
  const locale = await getLocale();
  const t = content[locale];

  return (
    <main className="page">
      <nav className="nav" aria-label="Main">
        <div className="brand">
          <Image src="/resulam_logo.png" alt="Resulam" width={44} height={44} priority />
          <span>Resulam</span>
        </div>
        <span className="language">{t.navLanguage}</span>
      </nav>

      <section className="hero">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <div className="heroActions">
          <a className="primaryCta" href="#book">
            {t.cta}
          </a>
          <span className="note">{t.limit}</span>
        </div>
      </section>

      <section className="section" aria-label="Event details">
        <div className="infoBar">
          <div className="infoItem">
            <span className="infoLabel">{t.dateLabel}</span>
            <span className="infoValue">{t.dateValue}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel">{t.visitLabel}</span>
            <span className="infoValue">{t.visitValue}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel">{t.costLabel}</span>
            <span className="infoValue">{t.costValue}</span>
          </div>
        </div>
      </section>

      <section className="section twoCol">
        <div>
          <h2>{t.sectionTitle}</h2>
          <p className="lead">{t.sectionText}</p>
          <ul className="benefits">
            {t.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
        <BookingForm copy={t.form} locale={locale} />
      </section>

      <footer className="footer">{t.footer}</footer>
    </main>
  );
}
