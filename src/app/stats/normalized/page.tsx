import Link from "next/link";
import { AdminLoginPanel } from "@/components/AdminLoginPanel";
import { adminContent, normalizedStatsContent } from "@/lib/content";
import {
  getAdminSession,
  isAdminAccessGranted,
  type AdminAuthErrorCode,
} from "@/lib/admin-auth";
import { getNormalizedLanguageStats } from "@/lib/language-stats-normalize";
import { getLocale } from "@/lib/locale";

function buildProtectedHref(path: string, lang?: string) {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function parseAuthError(value?: string): AdminAuthErrorCode | undefined {
  if (
    value === "unauthorized" ||
    value === "oauth" ||
    value === "state" ||
    value === "config" ||
    value === "email"
  ) {
    return value;
  }
  return undefined;
}

export default async function NormalizedStatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; key?: string; error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = normalizedStatsContent[locale];
  const auth = adminContent[locale];
  const returnTo = buildProtectedHref("/stats/normalized", params?.lang);

  if (!(await isAdminAccessGranted(params?.key))) {
    return (
      <AdminLoginPanel
        locale={locale}
        returnTo={returnTo}
        error={parseAuthError(params?.error)}
      />
    );
  }

  const session = await getAdminSession();
  const stats = await getNormalizedLanguageStats();
  const maxCount = stats.languages[0]?.count ?? 1;
  const adminHref = buildProtectedHref("/admin", params?.lang);
  const rawStatsHref = buildProtectedHref("/stats", params?.lang);
  const normalizedTotal = stats.languages.reduce((sum, item) => sum + item.count, 0);

  return (
    <main className="statsPage">
      <div className="statsShell">
        <div className="statsHeader">
          <div>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            {session ? (
              <p className="adminSignedIn">
                {auth.signedInAs} <strong>{session.email}</strong>
              </p>
            ) : null}
          </div>
          <div className="adminHeaderLinks">
            <Link href={adminHref}>{locale === "fr" ? "Administration" : "Admin"}</Link>
            <Link href={rawStatsHref}>{t.rawStatsLink}</Link>
            <form action="/api/admin/auth/logout" method="POST">
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className="adminSignOutButton">
                {auth.signOut}
              </button>
            </form>
            <Link href="/">{t.back}</Link>
          </div>
        </div>

        <div className="statsSummary">
          <span>{t.totalBookings}</span>
          <strong>{stats.totalBookings}</strong>
        </div>

        {normalizedTotal > stats.totalBookings && stats.totalBookings > 0 ? (
          <p className="statsNote">{t.splitNote}</p>
        ) : null}

        {stats.languages.length === 0 ? (
          <p className="statsEmpty">{t.empty}</p>
        ) : (
          <div className="statsTable" role="table" aria-label={t.title}>
            <div className="statsRow statsRowHead" role="row">
              <span role="columnheader">{t.language}</span>
              <span role="columnheader">{t.reservations}</span>
              <span role="columnheader">{t.share}</span>
            </div>
            {stats.languages.map((item) => {
              const share = stats.totalBookings
                ? Math.round((item.count / stats.totalBookings) * 100)
                : 0;

              return (
                <div className="statsRow" role="row" key={item.name}>
                  <span className="statsLanguage" role="cell">
                    {item.name}
                  </span>
                  <span className="statsCount" role="cell">
                    {item.count}
                  </span>
                  <span className="statsBarCell" role="cell">
                    <span className="statsBarTrack" aria-hidden="true">
                      <span
                        className="statsBarFill"
                        style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                      />
                    </span>
                    <span className="statsShare">{share}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
