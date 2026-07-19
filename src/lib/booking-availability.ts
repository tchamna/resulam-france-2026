export type AvailabilityCounts = {
  capacity: number;
  booked: number;
  remaining: number;
  full: boolean;
  waitlistCount?: number;
};

/** Sold out only when no places remain; ignore a stale full flag. */
export function isFullyBooked(remaining: number, _full = false): boolean {
  return remaining <= 0;
}

export function normalizeBookingAvailability(
  availability: AvailabilityCounts,
): AvailabilityCounts & { waitlistCount: number } {
  const remaining = Math.max(Math.floor(availability.remaining), 0);
  const full = isFullyBooked(remaining);
  const waitlistCount = full
    ? Math.max(Math.floor(availability.waitlistCount ?? 0), 0)
    : 0;

  return {
    capacity: Math.max(Math.floor(availability.capacity), 0),
    booked: Math.max(Math.floor(availability.booked), 0),
    remaining,
    full,
    waitlistCount,
  };
}
