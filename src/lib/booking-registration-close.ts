/** Midnight after 29 July 2026, Paris (CEST). Override with BOOKING_REGISTRATION_CLOSES_AT. */
export const DEFAULT_REGISTRATION_CLOSES_AT = "2026-07-30T00:00:00+02:00";

export function getRegistrationClosesAtIso() {
  const raw = process.env.BOOKING_REGISTRATION_CLOSES_AT?.trim();
  if (raw && /^(false|off|0|none)$/i.test(raw)) return null;
  return raw || DEFAULT_REGISTRATION_CLOSES_AT;
}

export function getRegistrationClosesAtMs(now = Date.now()): number | null {
  const iso = getRegistrationClosesAtIso();
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return ms;
}

export function isRegistrationClosed(now = Date.now()) {
  const closesAt = getRegistrationClosesAtMs(now);
  if (closesAt === null) return false;
  return now >= closesAt;
}
