import type { Locale } from "@/lib/locale";
import type { StoredBooking } from "@/lib/bookings";

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvHeaders(locale: Locale): string[] {
  if (locale === "fr") {
    return [
      "Nom",
      "E-mail",
      "Téléphone",
      "Langues",
      "Langue du site",
      "Liste d'attente",
      "Date d'inscription",
    ];
  }
  return ["Name", "Email", "Phone", "Languages", "Locale", "Waitlist", "Registered at"];
}

function waitlistLabel(locale: Locale, waitlist: boolean | undefined) {
  if (locale === "fr") return waitlist ? "oui" : "non";
  return waitlist ? "yes" : "no";
}

export function bookingsToCsv(bookings: StoredBooking[], locale: Locale = "en") {
  const rows = bookings.map((booking) =>
    [
      booking.name,
      booking.email,
      booking.phone,
      booking.languages,
      booking.locale,
      waitlistLabel(locale, booking.waitlist),
      booking.createdAt,
    ]
      .map((cell) => escapeCsvCell(String(cell ?? "")))
      .join(","),
  );

  return [csvHeaders(locale).map(escapeCsvCell).join(","), ...rows].join("\r\n");
}

/** UTF-8 with BOM for Excel. */
export function bookingsToCsvUtf8Sig(bookings: StoredBooking[], locale: Locale = "en") {
  const csv = bookingsToCsv(bookings, locale);
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, "utf8")]);
}
