import Image from "next/image";
import { BookstoreBanner } from "@/components/BookstoreBanner";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { EventVenues } from "@/components/EventVenues";
import { GreetingsMarquee } from "@/components/GreetingsMarquee";
import { HeroContactPrompt } from "@/components/HeroContactPrompt";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ProgrammeSection } from "@/components/ProgrammeSection";
import type { BookingAvailability } from "@/lib/bookings";
import { AFRICAN_LANGUAGE_LIBRARY_URL, formatHeritageUrgency, type PageCopy } from "@/lib/content";
import { buildPageHref } from "@/lib/design";
import type { DesignVariant } from "@/lib/design";
import type { Locale } from "@/lib/locale";

type HeritageLandingProps = {
  locale: Locale;
  design: DesignVariant;
  t: PageCopy;
  alternateLocale: Locale;
  alternateLabel: string;
  initialAvailability: BookingAvailability;
};

export function HeritageLanding({
  locale,
  design,
  t,
  alternateLocale,
  alternateLabel,
  initialAvailability,
}: HeritageLandingProps) {
  const h = t.heritage;
  const urgency = formatHeritageUrgency(h, initialAvailability.remaining, initialAvailability.full);

  return (
    <main className="page-heritage">
      <div className="heritageWatermark" aria-hidden="true" />

      <nav className="heritageNav" aria-label="Main">
        <div className="heritageBrand">
          <Image src="/resulam_logo.png" alt="Resulam" width={48} height={48} priority />
          <span>Resulam</span>
        </div>

        <div className="heritageNavActions">
          <a
            href={AFRICAN_LANGUAGE_LIBRARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="heritageNavResourcesLink"
          >
            {t.navResources}
          </a>
          <DesignSwitcher locale={locale} design={design} />
          <div className="heritageLang" aria-label="Language switcher">
            <span>{t.navLanguage}</span>
            <a href={buildPageHref(alternateLocale, design)}>{alternateLabel}</a>
          </div>
        </div>
      </nav>

      <section className="heritageHero scrollSection">
        <div className="heritageFrame">
          <div className="heritageFrameInner">
            <div className="heritageHeroGrid">
              <div className="heritageCopy">
                <div className="heritageCopyTop">
                  <div className="heritageStamp">
                    <span>{h.stamp}</span>
                  </div>
                  <h1 className="heritageHeroTitle">{h.eventLine}</h1>
                </div>

                <p className="heritageHeadline">{h.headline}</p>
                <p className="heritageLead">{t.lead}</p>

                <div className="heritageHeroActions">
                  <p className="heritageUrgency">{urgency}</p>
                  <a className="heritagePrimaryCta" href="#book">
                    {t.cta}
                  </a>
                  <HeroContactPrompt t={t} />
                  <span className="heritageNote">{t.limit}</span>
                </div>
              </div>

              <div className="heritageLibrary">
                <p className="heritageLibraryTitle">
                  {h.libraryTitle}
                  <span>{h.librarySubtitle}</span>
                </p>
                <MediaCarousel t={t} showTitle={false} className="heritageCarousel" />
                <p className="heritageLibraryNote">{h.libraryNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="heritageInfo scrollSection" aria-label="Event details">
        <div className="heritageInfoBar">
          <div className="heritageInfoItem">
            <span>{t.dateLabel}</span>
            <strong>{t.dateValue}</strong>
          </div>
          <div className="heritageInfoItem">
            <span>{t.visitLabel}</span>
            <strong>{t.visitValue}</strong>
          </div>
          <div className="heritageInfoItem">
            <span>{t.costLabel}</span>
            <strong>{t.costValue}</strong>
          </div>
          <div className="heritageInfoItem">
            <span>{t.locationLabel}</span>
            <strong>{t.locationValue}</strong>
          </div>
        </div>
        <EventVenues t={t} variant="heritage" />
      </section>

      <GreetingsMarquee copy={t.greetings} />

      <ProgrammeSection
        locale={locale}
        t={t}
        initialAvailability={initialAvailability}
        variant="heritage"
      />

      <BookstoreBanner t={t} variant="heritage" />

      <footer className="heritageFooter scrollSection">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
