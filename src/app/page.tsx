import Image from "next/image";
import { headers } from "next/headers";
import { BookingForm } from "@/components/BookingForm";

const content = {
  en: {
    navLanguage: "English",
    eyebrow: "France visit: August 6-11, 2026",
    title: "Resulam France 2026",
    kicker: "Free conference",
    lead:
      "Reconnect with your mother tongue and learn practical ways to transmit African languages at home.",
    cta: "Book a free place",
    limit: "Free entry. Places are limited, booking is required.",
    dateLabel: "Conference",
    dateValue: "Sunday, August 9, 2026",
    visitLabel: "Resulam in France",
    visitValue: "August 6-11, 2026",
    costLabel: "Cost",
    costValue: "Free entry",
    mediaTitle: "Videos, books, applications and USB learning resources",
    testimony: "Nufi testimony",
    cartoons: "Learning videos",
    books: "Books and grammar resources",
    sectionTitle: "What you will discover",
    sectionText: "A practical day for families, adults, and anyone who wants to restart language transmission.",
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
      languages: "African languages you are interested in",
      languagesPlaceholder: "Example: Nufi, Duala, Lingala, Yoruba...",
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
    kicker: "Grande conférence gratuite",
    lead:
      "Retrouvez votre langue maternelle et découvrez des méthodes concrètes pour transmettre les langues africaines à la maison.",
    cta: "Réserver gratuitement",
    limit: "Entrée gratuite. Places limitées, réservation obligatoire.",
    dateLabel: "Conférence",
    dateValue: "Dimanche 9 août 2026",
    visitLabel: "Resulam en France",
    visitValue: "6-11 août 2026",
    costLabel: "Tarif",
    costValue: "Entrée gratuite",
    mediaTitle: "Vidéos, livres, applications et clés USB d'apprentissage",
    testimony: "Témoignage en nufi",
    cartoons: "Vidéos d'apprentissage",
    books: "Livres et grammaire",
    sectionTitle: "Ce que vous allez découvrir",
    sectionText:
      "Une journée pratique pour les familles, les adultes, et toute personne qui veut relancer la transmission des langues.",
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
      languages: "Langues africaines qui vous intéressent",
      languagesPlaceholder: "Exemple : nufi, duala, lingala, yoruba...",
      optional: "facultatif",
      button: "Réserver",
      sending: "Envoi...",
      success: "Votre demande de réservation a été reçue.",
      error: "Impossible d'envoyer votre réservation. Veuillez réessayer.",
    },
    footer: "Resulam France 2026",
  },
};

async function getLocale(lang?: string): Promise<"en" | "fr"> {
  if (lang === "fr" || lang === "en") {
    return lang;
  }

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().startsWith("fr") ? "fr" : "en";
}

function CarouselItems({ t }: { t: typeof content.en }) {
  return (
    <>
      <div className="carouselItem carouselVideo">
        <video autoPlay muted loop playsInline poster="/landing/nufi-cartoon-presentation.png">
          <source src="/landing/pangop-temoignage-nufi-1.mp4" type="video/mp4" />
        </video>
        <span>{t.testimony}</span>
      </div>
      <a
        className="carouselItem"
        href="https://www.youtube.com/watch?v=rr2nlVF7kgE&t=55s"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="/landing/nufi-cartoon-presentation.png" alt="Resulam Nufi cartoon preview" fill sizes="360px" loading="eager" />
        <span>{t.cartoons}</span>
      </a>
      <a
        className="carouselItem"
        href="https://www.youtube.com/watch?v=xusm6BsMVWg"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="https://img.youtube.com/vi/xusm6BsMVWg/hqdefault.jpg" alt="Resulam African language cartoon preview" fill sizes="360px" loading="eager" />
        <span>{t.cartoons}</span>
      </a>
      <div className="carouselItem bookSlide">
        <Image src="/landing/african-tales-book.png" alt="African tales in Nufi and French" fill sizes="260px" loading="eager" />
        <span>{t.books}</span>
      </div>
      <div className="carouselItem bookSlide">
        <Image src="/landing/nufi-grammar-book.png" alt="Nufi grammar book and ebook" fill sizes="260px" loading="eager" />
        <span>{t.books}</span>
      </div>
    </>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = content[locale];
  const alternateLocale = locale === "fr" ? "en" : "fr";
  const alternateLabel = alternateLocale === "fr" ? "Français" : "English";

  return (
    <main className="page">
      <nav className="nav" aria-label="Main">
        <div className="brand">
          <Image src="/resulam_logo.png" alt="Resulam" width={44} height={44} priority />
          <span>Resulam</span>
        </div>
        <div className="languageSwitcher" aria-label="Language switcher">
          <span className="currentLanguage">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12S9.6 18.4 12 21" />
            </svg>
            {t.navLanguage}
          </span>
          <a href={`/?lang=${alternateLocale}`} className="languageLink">
            {alternateLabel}
          </a>
        </div>
      </nav>

      <section className="flyerHero">
        <div className="flyerFrame">
          <div className="flyerTop">
            <span>{t.eyebrow}</span>
            <strong>{t.costValue}</strong>
          </div>

          <div className="flyerMain">
            <div className="flyerCopy">
              <p className="kicker">{t.kicker}</p>
              <h1>{t.title}</h1>
              <p className="lead">{t.lead}</p>

              <div className="dateRibbon">
                <span>{t.dateLabel}</span>
                <strong>{t.dateValue}</strong>
              </div>

              <div className="heroActions">
                <a className="primaryCta" href="#book">
                  {t.cta}
                </a>
                <span className="note">{t.limit}</span>
              </div>
            </div>

            <div className="flyerCarousel" aria-label={t.mediaTitle}>
              <p>{t.mediaTitle}</p>
              <div className="carouselMask">
                <div className="carouselTrack">
                  <CarouselItems t={t} />
                  <CarouselItems t={t} />
                </div>
              </div>
            </div>
          </div>
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
