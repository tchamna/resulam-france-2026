type PlacesLeftCopy = {
  seatsLeft: string;
  seatsLeftOne: string;
  soldOut: string;
};

export function formatPlacesLeft(
  copy: PlacesLeftCopy,
  remaining: number,
  full: boolean,
): string {
  if (full || remaining <= 0) {
    return copy.soldOut;
  }
  if (remaining === 1) {
    return copy.seatsLeftOne;
  }
  return copy.seatsLeft.replace("{count}", String(remaining));
}
