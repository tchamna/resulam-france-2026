import { NextResponse } from "next/server";
import {
  ADMIN_OAUTH_RETURN_COOKIE,
  ADMIN_OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  createOAuthState,
  getAppOrigin,
  getGoogleRedirectUri,
  getOAuthCookieOptions,
  isGoogleAuthConfigured,
  isSecureRequest,
  sanitizeAdminReturnPath,
} from "@/lib/admin-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request);
  const email = url.searchParams.get("email")?.trim();
  const returnTo = sanitizeAdminReturnPath(url.searchParams.get("returnTo"));

  if (!isGoogleAuthConfigured()) {
    const loginUrl = new URL("/admin", origin);
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  if (!email) {
    const loginUrl = new URL(returnTo.startsWith("/stats") ? "/stats" : "/admin", origin);
    loginUrl.searchParams.set("error", "email");
    return NextResponse.redirect(loginUrl);
  }

  const state = createOAuthState();
  const redirectUri = getGoogleRedirectUri(request);
  const googleUrl = buildGoogleAuthUrl({ redirectUri, state, email });
  const secure = isSecureRequest(request);

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(ADMIN_OAUTH_STATE_COOKIE, state, getOAuthCookieOptions(secure));
  response.cookies.set(ADMIN_OAUTH_RETURN_COOKIE, returnTo, getOAuthCookieOptions(secure));
  return response;
}
