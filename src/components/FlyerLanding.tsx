import Image from "next/image";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { GreetingsMarquee } from "@/components/GreetingsMarquee";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ProgrammeSection } from "@/components/ProgrammeSection";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import { buildPageHref } from "@/lib/design";
import type { DesignVariant } from "@/lib/design";
import type { Locale } from "@/lib/locale";

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

      <section className="flyerHero scrollSection">
        <div className="flyerFrame">
          <div className="flyerTop">
            <span>{t.eyebrow}</span>
            <strong>{t.costValue}</strong>
          </div>

          <div className="flyerMain">
            <div className="flyerCopy">
              <p className="kicker">{t.kicker}</p>
              <h1 className="heroDate">{t.heroDate}</h1>
              <p className="heroTitle">{t.heroTitle}</p>
              <p className="lead">{t.lead}</p>

              <div className="heroActions">
                <a className="primaryCta" href="#book">
                  {t.cta}
                </a>
                <span className="note">{t.limit}</span>
              </div>
            </div>

            <MediaCarousel t={t} />
          </div>
        </div>
      </section>

      <section className="section scrollSection" aria-label="Event details">
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
      </section>

      <GreetingsMarquee copy={t.greetings} />

      <ProgrammeSection locale={locale} t={t} initialAvailability={initialAvailability} variant="flyer" />

      <footer className="footer scrollSection">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
