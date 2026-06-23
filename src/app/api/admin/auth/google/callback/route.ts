import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_OAUTH_RETURN_COOKIE,
  ADMIN_OAUTH_STATE_COOKIE,
  ADMIN_SESSION_COOKIE,
  buildAdminLoginHref,
  createSessionToken,
  exchangeGoogleCode,
  fetchGoogleUserEmail,
  getAppOrigin,
  getGoogleRedirectUri,
  getSessionCookieOptions,
  isAllowedAdminEmail,
  isGoogleAuthConfigured,
  sanitizeAdminReturnPath,
} from "@/lib/admin-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request);
  const returnPath = sanitizeAdminReturnPath(
    (await cookies()).get(ADMIN_OAUTH_RETURN_COOKIE)?.value,
  );
  const loginPath = returnPath.startsWith("/stats") ? "/stats" : "/admin";

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL(buildAdminLoginHref(loginPath, undefined, "config"), origin));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(ADMIN_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL(buildAdminLoginHref(loginPath, undefined, "state"), origin));
  }

  try {
    const redirectUri = getGoogleRedirectUri(request);
    const tokens = await exchangeGoogleCode(code, redirectUri);
    if (!tokens.access_token) {
      throw new Error("Missing Google access token");
    }

    const email = await fetchGoogleUserEmail(tokens.access_token);
    if (!isAllowedAdminEmail(email)) {
      return NextResponse.redirect(
        new URL(buildAdminLoginHref(loginPath, undefined, "unauthorized"), origin),
      );
    }

    const sessionToken = createSessionToken(email);
    const secure = url.protocol === "https:";
    const response = NextResponse.redirect(new URL(returnPath, origin));
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, getSessionCookieOptions(secure));
    response.cookies.set(ADMIN_OAUTH_STATE_COOKIE, "", { ...getSessionCookieOptions(secure), maxAge: 0 });
    response.cookies.set(ADMIN_OAUTH_RETURN_COOKIE, "", { ...getSessionCookieOptions(secure), maxAge: 0 });
    return response;
  } catch {
    return NextResponse.redirect(new URL(buildAdminLoginHref(loginPath, undefined, "oauth"), origin));
  }
}
