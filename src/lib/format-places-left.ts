import { isFullyBooked, isGroup2Phase } from "@/lib/booking-availability";

type PlacesLeftCopy = {
  seatsLeft: string;
  seatsLeftOne: string;
  group2Badge: string;
  group2BadgeOne: string;
  waitlistBadge: string;
};

export function formatPlacesLeft(
  copy: PlacesLeftCopy,
  remaining: number,
  full: boolean,
  waitlistCount = 0,
  booked = 0,
  group1Capacity = 50,
): string {
  if (isFullyBooked(remaining, full)) {
    return copy.waitlistBadge.replace("{count}", String(waitlistCount));
  }
  if (isGroup2Phase(booked, remaining, group1Capacity)) {
    if (remaining === 1) {
      return copy.group2BadgeOne;
    }
    return copy.group2Badge.replace("{count}", String(remaining));
  }
  if (remaining === 1) {
    return copy.seatsLeftOne;
  }
  return copy.seatsLeft.replace("{count}", String(remaining));
}
