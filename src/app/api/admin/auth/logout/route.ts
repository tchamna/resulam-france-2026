import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionCookieOptions,
  sanitizeAdminReturnPath,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const returnTo = sanitizeAdminReturnPath(String(formData.get("returnTo") ?? "/admin"));
  const secure = url.protocol === "https:";

  const response = NextResponse.redirect(new URL(returnTo, url.origin), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...getSessionCookieOptions(secure), maxAge: 0 });
  return response;
}
