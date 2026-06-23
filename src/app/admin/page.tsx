import Link from "next/link";
import { AdminLoginPanel } from "@/components/AdminLoginPanel";
import { readBookings, type StoredBooking } from "@/lib/bookings";
import { adminContent } from "@/lib/content";
import {
  getAdminSession,
  isAdminAccessGranted,
  type AdminAuthErrorCode,
} from "@/lib/admin-auth";
import { getLanguageStats } from "@/lib/language-stats";
import { getLocale, type Locale } from "@/lib/locale";

function formatBookingDate(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortBookingsNewestFirst(bookings: StoredBooking[]) {
  return [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; key?: string; error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = adminContent[locale];
  const returnTo = buildProtectedHref("/admin", params?.lang);

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
  const [stats, bookings] = await Promise.all([getLanguageStats(), readBookings()]);
  const attendees = sortBookingsNewestFirst(bookings);
  const maxCount = stats.languages[0]?.count ?? 1;
  const statsHref = buildProtectedHref("/stats", params?.lang);

  return (
    <main className="statsPage adminPage">
      <div className="statsShell adminShell">
        <div className="statsHeader">
          <div>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            {session ? (
              <p className="adminSignedIn">
                {t.signedInAs} <strong>{session.email}</strong>
              </p>
            ) : null}
          </div>
          <div className="adminHeaderLinks">
            <Link href={statsHref}>{t.statsLink}</Link>
            <form action="/api/admin/auth/logout" method="POST">
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className="adminSignOutButton">
                {t.signOut}
              </button>
            </form>
            <Link href="/">{t.back}</Link>
          </div>
        </div>

        <div className="statsSummary">
          <span>{t.totalBookings}</span>
          <strong>{stats.totalBookings}</strong>
        </div>

        {stats.totalBookings === 0 ? (
          <p className="statsEmpty">{t.empty}</p>
        ) : (
          <>
            <section className="adminSection" aria-labelledby="admin-languages-heading">
              <h2 id="admin-languages-heading">{t.languagesChart}</h2>
              <div className="statsTable" role="table" aria-label={t.languagesChart}>
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
            </section>

            <section className="adminSection" aria-labelledby="admin-subscribers-heading">
              <h2 id="admin-subscribers-heading">{t.subscribers}</h2>
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th scope="col">{t.name}</th>
                      <th scope="col">{t.email}</th>
                      <th scope="col">{t.phone}</th>
                      <th scope="col">{t.languages}</th>
                      <th scope="col">{t.locale}</th>
                      <th scope="col">{t.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((booking) => (
                      <tr key={`${booking.email}-${booking.createdAt}`}>
                        <td>{booking.name}</td>
                        <td>
                          <a href={`mailto:${booking.email}`}>{booking.email}</a>
                        </td>
                        <td>{booking.phone || "—"}</td>
                        <td>{booking.languages || "—"}</td>
                        <td>{booking.locale.toUpperCase()}</td>
                        <td>{formatBookingDate(booking.createdAt, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
