import { NextResponse } from "next/server";
import { isReminderCronAuthorized } from "@/lib/booking-reminders";
import { runAttendanceReplyForwarding } from "@/lib/attendance-reply-forwarding";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isReminderCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAttendanceReplyForwarding();
    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (error) {
    console.error("[attendance-replies] POST failed", error);
    return NextResponse.json({ error: "attendance_reply_forward_failed" }, { status: 500 });
  }
}
