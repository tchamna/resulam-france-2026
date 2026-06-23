import { FlyerLanding } from "@/components/FlyerLanding";
import { HeritageLanding } from "@/components/HeritageLanding";
import { LandingExperience } from "@/components/LandingExperience";
import { MidnightLanding } from "@/components/MidnightLanding";
import { getBookingAvailability } from "@/lib/bookings";
import { content } from "@/lib/content";
import { getDesign } from "@/lib/design";
import { getLocale, type Locale } from "@/lib/locale";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; design?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const design = getDesign(params?.design);
  const t = content[locale];
  const alternateLocale: Locale = locale === "fr" ? "en" : "fr";
  const alternateLabel = alternateLocale === "fr" ? "Français" : "English";
  const availability = await getBookingAvailability();

  const landingProps = {
    locale,
    design,
    t,
    alternateLocale,
    alternateLabel,
    initialAvailability: availability,
  };

  if (design === "midnight") {
    return (
      <LandingExperience formCopy={t.form} musicCopy={t.music} initialAvailability={availability} variant={design}>
        <MidnightLanding {...landingProps} />
      </LandingExperience>
    );
  }

  if (design === "heritage") {
    return (
      <LandingExperience formCopy={t.form} musicCopy={t.music} initialAvailability={availability} variant={design}>
        <HeritageLanding {...landingProps} />
      </LandingExperience>
    );
  }

  return (
    <LandingExperience formCopy={t.form} musicCopy={t.music} initialAvailability={availability} variant={design}>
      <FlyerLanding {...landingProps} />
    </LandingExperience>
  );
}
