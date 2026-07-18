type PlacesLeftCopy = {
  seatsLeft: string;
  seatsLeftOne: string;
  waitlistBadge: string;
};

export function formatPlacesLeft(
  copy: PlacesLeftCopy,
  remaining: number,
  full: boolean,
  waitlistCount = 0,
): string {
  if (full || remaining <= 0) {
    return copy.waitlistBadge.replace("{count}", String(waitlistCount));
  }
  if (remaining === 1) {
    return copy.seatsLeftOne;
  }
  return copy.seatsLeft.replace("{count}", String(remaining));
}
