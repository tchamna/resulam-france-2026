import { NextRequest, NextResponse } from "next/server";
import { isAdminAccessGranted } from "@/lib/admin-auth";
import { clearBookSubscribers } from "@/lib/book-subscribers";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!(await isAdminAccessGranted(key))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const deleted = await clearBookSubscribers();
  return NextResponse.json({ ok: true, deleted }, { headers: { "Cache-Control": "no-store" } });
}
