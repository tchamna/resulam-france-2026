import { FlyerLanding } from "@/components/FlyerLanding";
import { MidnightLanding } from "@/components/MidnightLanding";
import { getBookingAvailability } from "@/lib/bookings";
import { content } from "@/lib/content";
import { getDesign } from "@/lib/design";
import { getLocale } from "@/lib/locale";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; design?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const design = getDesign(params?.design);
  const t = content[locale];
  const alternateLocale = locale === "fr" ? "en" : "fr";
  const alternateLabel = alternateLocale === "fr" ? "Français" : "English";
  const availability = await getBookingAvailability();

  if (design === "midnight") {
    return (
      <MidnightLanding
        locale={locale}
        design={design}
        t={t}
        alternateLocale={alternateLocale}
        alternateLabel={alternateLabel}
        initialAvailability={availability}
      />
    );
  }

  return (
    <FlyerLanding
      locale={locale}
      design={design}
      t={t}
      alternateLocale={alternateLocale}
      alternateLabel={alternateLabel}
      initialAvailability={availability}
    />
  );
}
