import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_OAUTH_STATE_COOKIE = "admin_oauth_state";
export const ADMIN_OAUTH_RETURN_COOKIE = "admin_oauth_return";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export type AdminSession = {
  email: string;
};

export type AdminAuthErrorCode = "unauthorized" | "oauth" | "state" | "config" | "email";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.BOOKING_STATS_KEY?.trim() ||
    (process.env.NODE_ENV !== "production" ? "dev-admin-session-secret" : "")
  );
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
}

export function isGoogleAuthConfigured() {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

export function getAllowedAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_ALLOWED_EMAILS?.trim() ||
    process.env.BOOKING_NOTIFY_EMAILS?.trim() ||
    "";

  return raw
    .split(/[,;]/)
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string) {
  const allowed = getAllowedAdminEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(normalizeEmail(email));
}

export function getAppOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return "http://localhost:3000";

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export function isSecureRequest(request: Request) {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto === "https";
  return new URL(request.url).protocol === "https:";
}

export function getGoogleRedirectUri(request: Request) {
  return `${getAppOrigin(request)}/api/admin/auth/google/callback`;
}

export function sanitizeAdminReturnPath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  if (!value.startsWith("/admin") && !value.startsWith("/stats")) return "/admin";
  return value;
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

type SessionPayload = {
  email: string;
  exp: number;
};

function encodeSessionPayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSessionPayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed?.email || typeof parsed.exp !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createSessionToken(email: string) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured");

  const payload: SessionPayload = {
    email: normalizeEmail(email),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = encodeSessionPayload(payload);
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  const payload = decodeSessionPayload(encoded);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) return null;

  return { email: payload.email };
}

export function getSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function getOAuthCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session || !isAllowedAdminEmail(session.email)) return null;
  return session;
}

export async function isAdminAccessGranted(key?: string) {
  const session = await getAdminSession();
  if (session) return true;

  if (!isGoogleAuthConfigured() && process.env.NODE_ENV !== "production") {
    return true;
  }

  const expectedKey = process.env.BOOKING_STATS_KEY?.trim();
  if (expectedKey && key && key === expectedKey) return true;

  return false;
}

export function buildGoogleAuthUrl(options: {
  redirectUri: string;
  state: string;
  email?: string;
}) {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: options.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state: options.state,
  });

  if (options.email) {
    params.set("login_hint", normalizeEmail(options.email));
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed");
  }

  return (await response.json()) as { access_token?: string };
}

export async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Google user profile fetch failed");
  }

  const profile = (await response.json()) as { email?: string; verified_email?: boolean };
  if (!profile.email) {
    throw new Error("Google profile did not include an email");
  }

  if (profile.verified_email === false) {
    throw new Error("Google email is not verified");
  }

  return normalizeEmail(profile.email);
}

export function buildAdminLoginHref(path: string, lang?: string, error?: AdminAuthErrorCode) {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
