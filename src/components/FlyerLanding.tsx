import Image from "next/image";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { GreetingsMarquee } from "@/components/GreetingsMarquee";
import { ProgrammeSection } from "@/components/ProgrammeSection";
import { VenueNotice } from "@/components/VenueNotice";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import { buildPageHref } from "@/lib/design";
import type { DesignVariant } from "@/lib/design";
import type { Locale } from "@/lib/locale";

function CarouselItems({ t }: { t: PageCopy }) {
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

type FlyerLandingProps = {
  locale: Locale;
  design: DesignVariant;
  t: PageCopy;
  alternateLocale: Locale;
  alternateLabel: string;
  initialAvailability: BookingAvailability;
};

export function FlyerLanding({ locale, design, t, alternateLocale, alternateLabel, initialAvailability }: FlyerLandingProps) {
  return (
    <main className="page-flyer">
      <nav className="nav" aria-label="Main">
        <div className="brand">
          <Image src="/resulam_logo.png" alt="Resulam" width={44} height={44} priority />
          <span>Resulam</span>
        </div>
        <div className="navActions">
          <DesignSwitcher locale={locale} design={design} />
          <div className="languageSwitcher" aria-label="Language switcher">
            <span className="currentLanguage">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12S9.6 18.4 12 21" />
              </svg>
              {t.navLanguage}
            </span>
            <a href={buildPageHref(alternateLocale, design)} className="languageLink">
              {alternateLabel}
            </a>
          </div>
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
          <div className="infoItem">
            <span className="infoLabel">{t.locationLabel}</span>
            <span className="infoValue">{t.locationValue}</span>
          </div>
        </div>
        <VenueNotice {...t.venueNotice} />
      </section>

      <GreetingsMarquee copy={t.greetings} />

      <ProgrammeSection locale={locale} t={t} initialAvailability={initialAvailability} variant="flyer" />

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
