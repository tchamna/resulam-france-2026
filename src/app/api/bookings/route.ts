import { NextRequest, NextResponse } from "next/server";
import { sendBookingEmails } from "@/lib/booking-email";
import {
  findBookingByEmail,
  getBookingAvailability,
  saveBooking,
  validateBooking,
} from "@/lib/bookings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const availability = await getBookingAvailability();
    return NextResponse.json(availability);
  } catch (error) {
    console.error("[bookings] GET failed", error);
    return NextResponse.json({ error: "availability_failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const booking = validateBooking((raw ?? {}) as Record<string, unknown>);
  if (!booking) {
    return NextResponse.json({ error: "invalid_booking" }, { status: 400 });
  }

  const availability = await getBookingAvailability();
  if (availability.full) {
    return NextResponse.json({ error: "full", ...availability }, { status: 409 });
  }

  const existing = await findBookingByEmail(booking.email);
  if (existing) {
    return NextResponse.json({ error: "duplicate", ...availability }, { status: 409 });
  }

  try {
    await saveBooking(booking);
    const updated = await getBookingAvailability();

    void sendBookingEmails(booking, updated).catch((error) => {
      console.error("[bookings] Saved booking but email delivery failed", error);
    });

    return NextResponse.json({ ok: true, ...updated });
  } catch (error) {
    console.error("[bookings] Failed to save booking", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
