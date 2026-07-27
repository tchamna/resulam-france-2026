import { NextRequest, NextResponse } from "next/server";
import { isAdminAccessGranted } from "@/lib/admin-auth";
import { readBookings } from "@/lib/bookings";
import { bookingsToCsvUtf8Sig } from "@/lib/bookings-csv";
import type { Locale } from "@/lib/locale";

export const runtime = "nodejs";

function parseLocale(value: string | null): Locale {
  return value === "fr" ? "fr" : "en";
}

function exportFilename(locale: Locale) {
  const date = new Date().toISOString().slice(0, 10);
  const prefix = locale === "fr" ? "inscriptions-resulam" : "resulam-bookings";
  return `${prefix}-${date}.csv`;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!(await isAdminAccessGranted(key))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const locale = parseLocale(request.nextUrl.searchParams.get("lang"));
  const bookings = await readBookings();
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const body = bookingsToCsvUtf8Sig(sorted, locale);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(locale)}"`,
      "Cache-Control": "no-store",
    },
  });
}
