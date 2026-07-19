import { NextRequest, NextResponse } from "next/server";
import {
  sendBookingEmails,
  sendGuestBookingEmail,
  sendWaitlistEmails,
  sendGuestWaitlistEmail,
} from "@/lib/booking-email";
import {
  findBookingByEmail,
  getBookingAvailability,
  saveBooking,
  validateBooking,
} from "@/lib/bookings";
import { isFullyBooked } from "@/lib/booking-availability";

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
  const existing = await findBookingByEmail(booking.email);

  if (isFullyBooked(availability.remaining, availability.full)) {
    if (existing) {
      const emailResult = existing.waitlist
        ? await sendGuestWaitlistEmail(existing, availability)
        : await sendGuestBookingEmail(existing, availability);

      if (!emailResult.sentGuest) {
        console.error("[bookings] Existing entry found but confirmation email was not delivered", emailResult);
      }

      return NextResponse.json({
        ok: true,
        duplicate: true,
        waitlist: Boolean(existing.waitlist),
        ...availability,
        email: emailResult,
      });
    }

    try {
      await saveBooking(booking, { waitlist: true });
      const emailResult = await sendWaitlistEmails(booking, availability);
      if (!emailResult.sentGuest || !emailResult.sentAdmin) {
        console.error("[bookings] Saved waitlist entry but one or more emails were not delivered", emailResult);
      }

      return NextResponse.json({ ok: true, waitlist: true, ...availability, email: emailResult });
    } catch (error) {
      console.error("[bookings] Failed to save waitlist entry", error);
      return NextResponse.json({ error: "save_failed" }, { status: 500 });
    }
  }

  if (existing) {
    const emailResult = await sendGuestBookingEmail(existing, availability);
    if (!emailResult.sentGuest) {
      console.error("[bookings] Existing booking found but confirmation email was not delivered", emailResult);
    }

    return NextResponse.json({ ok: true, duplicate: true, ...availability, email: emailResult });
  }

  try {
    await saveBooking(booking);
    const updated = await getBookingAvailability();

    const emailResult = await sendBookingEmails(booking, updated);
    if (!emailResult.sentGuest || !emailResult.sentAdmin) {
      console.error("[bookings] Saved booking but one or more emails were not delivered", emailResult);
    }

    return NextResponse.json({ ok: true, ...updated, email: emailResult });
  } catch (error) {
    console.error("[bookings] Failed to save booking", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
