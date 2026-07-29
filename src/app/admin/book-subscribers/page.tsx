import Link from "next/link";
import { AdminLoginPanel } from "@/components/AdminLoginPanel";
import {
  getAdminSession,
  isAdminAccessGranted,
  type AdminAuthErrorCode,
} from "@/lib/admin-auth";
import { readBookSubscribers, type StoredBookSubscriber } from "@/lib/book-subscribers";
import { getLocale, type Locale } from "@/lib/locale";

function parseAuthError(value?: string): AdminAuthErrorCode | undefined {
  return value === "unauthorized" || value === "oauth" || value === "state" || value === "config" || value === "email"
    ? value
    : undefined;
}

function formatDate(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortNewestFirst(subscribers: StoredBookSubscriber[]) {
  return [...subscribers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default async function BookSubscribersPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; key?: string; error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const returnTo = `/admin/book-subscribers${params?.lang ? `?lang=${params.lang}` : ""}`;

  if (!(await isAdminAccessGranted(params?.key))) {
    return <AdminLoginPanel locale={locale} returnTo={returnTo} error={parseAuthError(params?.error)} />;
  }

  const [session, rawSubscribers] = await Promise.all([getAdminSession(), readBookSubscribers()]);
  const subscribers = sortNewestFirst(rawSubscribers);
  const exportParams = new URLSearchParams();
  if (params?.key) exportParams.set("key", params.key);
  const exportHref = `/api/admin/book-subscribers/export${exportParams.size ? `?${exportParams}` : ""}`;

  return (
    <main className="statsPage adminPage">
      <div className="statsShell adminShell">
        <div className="statsHeader">
          <div>
            <h1>Abonnés du livre</h1>
            <p>« Une langue, une vision du monde » — liste séparée des inscriptions Resulam France.</p>
            {session ? <p className="adminSignedIn">Connecté avec <strong>{session.email}</strong></p> : null}
          </div>
          <div className="adminHeaderLinks">
            <Link href="/admin">Inscriptions Resulam France</Link>
            <form action="/api/admin/auth/logout" method="POST">
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className="adminSignOutButton">Se déconnecter</button>
            </form>
            <Link href="/">Accueil</Link>
          </div>
        </div>

        <div className="statsSummary">
          <span>Abonnés au cercle de lecteurs</span>
          <strong>{subscribers.length}</strong>
        </div>

        {subscribers.length === 0 ? (
          <p className="statsEmpty">Aucun abonné pour le moment.</p>
        ) : (
          <section className="adminSection" aria-labelledby="book-subscribers-heading">
            <div className="adminSectionHead">
              <h2 id="book-subscribers-heading">Inscriptions</h2>
              <a className="adminCsvDownload" href={exportHref}>Télécharger le CSV</a>
            </div>
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead><tr><th scope="col">Nom</th><th scope="col">Ville et pays</th><th scope="col">Courriel</th><th scope="col">Consentement</th><th scope="col">Date</th></tr></thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={`${subscriber.email}-${subscriber.createdAt}`}>
                      <td>{subscriber.name}</td>
                      <td>{subscriber.location || "—"}</td>
                      <td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td>
                      <td>Oui</td>
                      <td>{formatDate(subscriber.createdAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
