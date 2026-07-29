import { NextRequest, NextResponse } from "next/server";
import { isAdminAccessGranted } from "@/lib/admin-auth";
import { clearBookSubscribers } from "@/lib/book-subscribers";

export const runtime = "nodejs";

async function clear(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!(await isAdminAccessGranted(key))) {
    return { authorized: false as const, deleted: 0 };
  }

  const deleted = await clearBookSubscribers();
  return { authorized: true as const, deleted };
}

export async function DELETE(request: NextRequest) {
  const result = await clear(request);
  if (!result.authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, deleted: result.deleted }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const result = await clear(request);
  if (!result.authorized) {
    return NextResponse.redirect(new URL("/admin/book-subscribers?error=unauthorized", request.url), 303);
  }

  return NextResponse.redirect(
    new URL(`/admin/book-subscribers?cleared=${result.deleted}`, request.url),
    303,
  );
}
