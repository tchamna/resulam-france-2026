import { NextResponse } from "next/server";
import {
  isVenueNoticeAuthorized,
  runVenueChangeNotices,
  VENUE_NOTICE_CAMPAIGN_ID,
} from "@/lib/venue-change-notices";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isVenueNoticeAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runVenueChangeNotices(VENUE_NOTICE_CAMPAIGN_ID);
    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (error) {
    console.error("[venue-notice] POST failed", error);
    return NextResponse.json({ error: "venue_notice_run_failed" }, { status: 500 });
  }
}
