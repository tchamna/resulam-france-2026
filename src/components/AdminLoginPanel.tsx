import Link from "next/link";
import { adminContent } from "@/lib/content";
import type { AdminAuthErrorCode } from "@/lib/admin-auth";
import type { Locale } from "@/lib/locale";

type AdminLoginPanelProps = {
  locale: Locale;
  returnTo: string;
  error?: AdminAuthErrorCode;
};

function getErrorMessage(locale: Locale, error?: AdminAuthErrorCode) {
  if (!error) return null;
  const t = adminContent[locale];
  if (error === "unauthorized") return t.loginErrorUnauthorized;
  if (error === "oauth") return t.loginErrorOAuth;
  if (error === "state") return t.loginErrorState;
  if (error === "config") return t.loginErrorConfig;
  if (error === "email") return t.loginErrorEmail;
  return t.loginErrorOAuth;
}

export function AdminLoginPanel({ locale, returnTo, error }: AdminLoginPanelProps) {
  const t = adminContent[locale];
  const errorMessage = getErrorMessage(locale, error);

  return (
    <main className="statsPage adminPage">
      <div className="statsShell adminLoginShell">
        <h1>{t.loginTitle}</h1>
        <p className="adminLoginIntro">{t.loginIntro}</p>

        {errorMessage ? <p className="adminLoginError">{errorMessage}</p> : null}

        <form className="adminLoginForm" action="/api/admin/auth/google" method="GET">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="adminLoginLabel" htmlFor="admin-email">
            {t.loginEmailLabel}
          </label>
          <input
            id="admin-email"
            className="adminLoginInput"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={t.loginEmailPlaceholder}
          />
          <button className="adminLoginButton" type="submit">
            {t.signInWithGoogle}
          </button>
        </form>

        <Link className="adminLoginBack" href={locale !== "en" ? `/?lang=${locale}` : "/"}>
          {t.back}
        </Link>
      </div>
    </main>
  );
}
