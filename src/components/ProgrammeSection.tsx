import { BookingForm } from "@/components/BookingForm";
import { DiscoverGrid } from "@/components/DiscoverGrid";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import type { Locale } from "@/lib/locale";

type ProgrammeSectionProps = {
  locale: Locale;
  t: PageCopy;
  initialAvailability: BookingAvailability;
  variant?: "flyer" | "midnight";
};

export function ProgrammeSection({
  locale,
  t,
  initialAvailability,
  variant = "flyer",
}: ProgrammeSectionProps) {
  return (
    <section className={variant === "midnight" ? "programmeSection programmeSectionMidnight scrollSection" : "section programmeSection scrollSection"} id="programme">
      <DiscoverGrid title={t.sectionTitle} intro={t.sectionText} items={t.benefits} />
      <BookingForm
        copy={t.form}
        venueNotice={t.venueNotice}
        locale={locale}
        initialAvailability={initialAvailability}
        variant={variant}
      />
    </section>
  );
}
