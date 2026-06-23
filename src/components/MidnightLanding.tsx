import { DesignSwitcher } from "@/components/DesignSwitcher";
import { GreetingsMarquee } from "@/components/GreetingsMarquee";
import { MomentsCarousel } from "@/components/MomentsCarousel";
import { ProgrammeSection } from "@/components/ProgrammeSection";
import { VenueNotice } from "@/components/VenueNotice";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import { getMomentSlides } from "@/lib/content";
import { buildPageHref } from "@/lib/design";
import type { DesignVariant } from "@/lib/design";
import type { Locale } from "@/lib/locale";

type MidnightLandingProps = {
  locale: Locale;
  design: DesignVariant;
  t: PageCopy;
  alternateLocale: Locale;
  alternateLabel: string;
  initialAvailability: BookingAvailability;
};

function HeroLead({ text, highlight }: { text: string; highlight: string }) {
  const parts = text.split(highlight);
  if (parts.length === 1) {
    return <p className="midnightLead">{text}</p>;
  }

  return (
    <p className="midnightLead">
      {parts[0]}
      <strong>{highlight}</strong>
      {parts[1]}
    </p>
  );
}

export function MidnightLanding({
  locale,
  design,
  t,
  alternateLocale,
  alternateLabel,
  initialAvailability,
}: MidnightLandingProps) {
  const m = t.midnight;
  const slides = getMomentSlides(t);

  return (
    <main className="page-midnight">
      <div className="midnightGlow" aria-hidden="true" />

      <header className="midnightNav">
        <div className="midnightBrand">
          <span className="midnightLogo">Resulam</span>
          <span className="midnightBadge">{m.badge}</span>
        </div>

        <nav className="midnightLinks" aria-label="Main">
          <a href="#visit">{m.navVisit}</a>
          <a href="#moments">{m.navMoments}</a>
          <a href="#conference">{m.navConference}</a>
          <a href="#book" className="midnightNavCta">
            {m.navBook}
          </a>
        </nav>

        <div className="midnightNavActions">
          <DesignSwitcher locale={locale} design={design} />
          <div className="midnightLang" aria-label="Language switcher">
            <span>{t.navLanguage}</span>
            <a href={buildPageHref(alternateLocale, design)}>{alternateLabel}</a>
          </div>
        </div>
      </header>

      <section className="midnightHero scrollSection">
        <p className="midnightTagline">• {m.tagline}</p>
        <h1 className="heroDate">{t.heroDate}</h1>
        <p className="heroTitle">{t.heroTitle}</p>

        <HeroLead text={m.heroLead} highlight={m.heroLeadHighlight} />

        <div className="midnightHeroActions">
          <a className="midnightPrimaryCta" href="#book">
            {m.ctaPrimary}
          </a>
          <a className="midnightSecondaryCta" href="#programme">
            {m.ctaSecondary}
          </a>
        </div>
      </section>

      <section className="midnightMoments scrollSection" id="moments" aria-labelledby="moments-title">
        <MomentsCarousel
          slides={slides}
          eyebrow={m.momentsLabel}
          title={m.momentsTitle}
          titleId="moments-title"
        />

        <div className="midnightStats" id="visit">
          <article className="midnightStat">
            <h3>{m.statDaysTitle}</h3>
            <p>{m.statDaysText}</p>
          </article>
          <article className="midnightStat midnightStatFeatured" id="conference">
            <h3>{m.statFreeTitle}</h3>
            <p>{m.statFreeText}</p>
          </article>
          <article className="midnightStat midnightStatAccent">
            <h3>{m.statLimitedTitle}</h3>
            <p>{m.statLimitedText}</p>
          </article>
        </div>

        <VenueNotice {...t.venueNotice} />
      </section>

      <GreetingsMarquee copy={t.greetings} />

      <ProgrammeSection
        locale={locale}
        t={t}
        initialAvailability={initialAvailability}
        variant="midnight"
      />

      <footer className="midnightFooter scrollSection">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
