export type AvailabilityCounts = {
  capacity: number;
  group1Capacity?: number;
  booked: number;
  remaining: number;
  full: boolean;
  waitlistCount?: number;
};

/** Sold out only when no places remain; ignore a stale full flag. */
export function isFullyBooked(remaining: number, _full = false): boolean {
  return remaining <= 0;
}

export function getGroup1Capacity() {
  const parsed = Number(process.env.BOOKING_GROUP1_CAPACITY ?? "50");
  if (!Number.isFinite(parsed) || parsed < 1) return 50;
  return Math.floor(parsed);
}

/** Groupe 1 is full but extended capacity (Groupe 2) still has room. */
export function isGroup2Phase(
  booked: number,
  remaining: number,
  group1Capacity = getGroup1Capacity(),
): boolean {
  return !isFullyBooked(remaining) && booked >= group1Capacity;
}

export function normalizeBookingAvailability(
  availability: AvailabilityCounts,
): AvailabilityCounts & { waitlistCount: number; group1Capacity: number } {
  const remaining = Math.max(Math.floor(availability.remaining), 0);
  const full = isFullyBooked(remaining);
  const waitlistCount = full
    ? Math.max(Math.floor(availability.waitlistCount ?? 0), 0)
    : 0;

  return {
    capacity: Math.max(Math.floor(availability.capacity), 0),
    group1Capacity: Math.max(
      Math.floor(availability.group1Capacity ?? getGroup1Capacity()),
      0,
    ),
    booked: Math.max(Math.floor(availability.booked), 0),
    remaining,
    full,
    waitlistCount,
  };
}
