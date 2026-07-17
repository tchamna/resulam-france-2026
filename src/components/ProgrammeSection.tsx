import { BookingForm } from "@/components/BookingForm";
import { DiscoverGrid } from "@/components/DiscoverGrid";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import type { DesignVariant } from "@/lib/design";
import type { Locale } from "@/lib/locale";

type ProgrammeSectionProps = {
  locale: Locale;
  t: PageCopy;
  initialAvailability: BookingAvailability;
  variant?: DesignVariant;
};

function programmeSectionClass(variant: DesignVariant): string {
  if (variant === "midnight") return "programmeSection programmeSectionMidnight scrollSection";
  if (variant === "heritage") return "programmeSection programmeSectionHeritage scrollSection";
  return "section programmeSection scrollSection";
}

export function ProgrammeSection({
  locale,
  t,
  initialAvailability,
  variant = "flyer",
}: ProgrammeSectionProps) {
  return (
    <section className={programmeSectionClass(variant)} id="programme">
      <DiscoverGrid title={t.sectionTitle} intro={t.sectionText} items={t.benefits} />
      <BookingForm
        copy={t.form}
        bookstorePopupCopy={{
          bookstorePopupTitle: t.bookstorePopupTitle,
          bookstorePopupMessage: t.bookstorePopupMessage,
          bookstorePopupClose: t.bookstorePopupClose,
          bookstoreLinkLabel: t.bookstoreLinkLabel,
          bookstoreAltNufi: t.bookstoreAltNufi,
          bookstoreAltEwondo: t.bookstoreAltEwondo,
        }}
        locale={locale}
        initialAvailability={initialAvailability}
        variant={variant}
      />
    </section>
  );
}
