import { BackgroundMusic } from "@/components/BackgroundMusic";
import { IdleAutoScroll } from "@/components/IdleAutoScroll";
import { SeatsBanner } from "@/components/SeatsBanner";
import type { BookingAvailability } from "@/lib/bookings";
import type { PageCopy } from "@/lib/content";
import type { DesignVariant } from "@/lib/design";

type LandingExperienceProps = {
  formCopy: PageCopy["form"];
  musicCopy: PageCopy["music"];
  initialAvailability: BookingAvailability;
  variant: DesignVariant;
  children: React.ReactNode;
};

export function LandingExperience({
  formCopy,
  musicCopy,
  initialAvailability,
  variant,
  children,
}: LandingExperienceProps) {
  return (
    <>
      <SeatsBanner
        copy={formCopy}
        initialAvailability={initialAvailability}
        variant={variant}
      />
      <BackgroundMusic copy={musicCopy} />
      <IdleAutoScroll />
      {children}
    </>
  );
}
