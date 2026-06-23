import { NextResponse } from "next/server";
import { isReminderCronAuthorized, runBookingReminders } from "@/lib/booking-reminders";
import { getParisDateString, getReminderPhase, shouldSendReminderOnDate } from "@/lib/event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isReminderCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runBookingReminders(getParisDateString());
    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (error) {
    console.error("[reminders] POST failed", error);
    return NextResponse.json({ error: "reminder_run_failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isReminderCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = getParisDateString();

  return NextResponse.json({
    today,
    phase: getReminderPhase(today),
    eligible: shouldSendReminderOnDate(today),
  });
}
