"use client";

import { useEffect, useState } from "react";
import type { BookingAvailability } from "@/lib/bookings";
import { formatPlacesLeft } from "@/lib/format-places-left";
import type { DesignVariant } from "@/lib/design";

type SeatsBannerCopy = {
  seatsLeft: string;
  seatsLeftOne: string;
  soldOut: string;
};

type SeatsBannerProps = {
  copy: SeatsBannerCopy;
  initialAvailability: BookingAvailability;
  variant?: DesignVariant;
};

function seatsBannerClass(variant: DesignVariant): string {
  if (variant === "midnight") return "seatsBanner seatsBannerMidnight";
  if (variant === "heritage") return "seatsBanner seatsBannerHeritage";
  return "seatsBanner";
}

export function SeatsBanner({ copy, initialAvailability, variant = "flyer" }: SeatsBannerProps) {
  const [availability, setAvailability] = useState(initialAvailability);

  useEffect(() => {
    let active = true;

    async function refreshAvailability() {
      try {
        const response = await fetch("/api/bookings", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as BookingAvailability;
        if (active) setAvailability(data);
      } catch {
        // Keep server-provided availability if refresh fails.
      }
    }

    refreshAvailability();
    const interval = window.setInterval(refreshAvailability, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const label = formatPlacesLeft(copy, availability.remaining, availability.full);

  return (
    <a
      className={seatsBannerClass(variant)}
      href="#book"
      aria-live="polite"
    >
      <span className="seatsBannerDot" aria-hidden="true" />
      <strong>{label}</strong>
    </a>
  );
}
