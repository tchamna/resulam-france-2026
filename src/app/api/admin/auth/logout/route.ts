import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAppOrigin,
  getSessionCookieOptions,
  isSecureRequest,
  sanitizeAdminReturnPath,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const returnTo = sanitizeAdminReturnPath(String(formData.get("returnTo") ?? "/admin"));
  const secure = isSecureRequest(request);

  const response = NextResponse.redirect(new URL(returnTo, getAppOrigin(request)), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...getSessionCookieOptions(secure), maxAge: 0 });
  return response;
}
