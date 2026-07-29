import { NextRequest, NextResponse } from "next/server";
import { sendBookSubscriberEmails } from "@/lib/book-subscriber-email";
import {
  findBookSubscriberByEmail,
  isBookSubscriberOriginAllowed,
  saveBookSubscriber,
  validateBookSubscriber,
} from "@/lib/book-subscribers";

export const runtime = "nodejs";

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!isBookSubscriberOriginAllowed(origin)) return {};
  return origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {};
}

export async function OPTIONS(request: NextRequest) {
  if (!isBookSubscriberOriginAllowed(request.headers.get("origin"))) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isBookSubscriberOriginAllowed(request.headers.get("origin"))) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: corsHeaders(request) });
  }

  const subscriber = validateBookSubscriber((raw ?? {}) as Record<string, unknown>);
  if (!subscriber) {
    return NextResponse.json({ error: "invalid_subscriber" }, { status: 400, headers: corsHeaders(request) });
  }

  try {
    const existing = await findBookSubscriberByEmail(subscriber.email);
    const stored = existing ?? (await saveBookSubscriber(subscriber));
    const email = await sendBookSubscriberEmails(stored);
    return NextResponse.json({ ok: true, duplicate: Boolean(existing), email }, { headers: corsHeaders(request) });
  } catch (error) {
    console.error("[book-subscribers] Failed to save subscriber", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500, headers: corsHeaders(request) });
  }
}
