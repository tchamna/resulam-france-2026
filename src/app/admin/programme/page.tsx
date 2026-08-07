import Link from "next/link";
import { AdminLoginPanel } from "@/components/AdminLoginPanel";
import { adminContent } from "@/lib/content";
import {
  getAdminSession,
  isAdminAccessGranted,
  type AdminAuthErrorCode,
} from "@/lib/admin-auth";
import { getLocale } from "@/lib/locale";
import { readProgrammeHtml } from "@/lib/programme-content";

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

export default async function AdminProgrammePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; key?: string; error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = adminContent[locale];
  const returnTo = buildProtectedHref("/admin/programme", params?.lang);
  const adminHref = buildProtectedHref("/admin", params?.lang);

  if (!(await isAdminAccessGranted(params?.key))) {
    return (
      <AdminLoginPanel
        locale={locale}
        returnTo={returnTo}
        error={parseAuthError(params?.error)}
      />
    );
  }

  const [session, programmeHtml] = await Promise.all([
    getAdminSession(),
    readProgrammeHtml(),
  ]);

  return (
    <main className="statsPage adminPage">
      <div className="statsShell adminShell">
        <div className="statsHeader">
          <div>
            <h1>{t.programmeTitle}</h1>
            <p>{t.programmeIntro}</p>
            <p className="adminDraftBadge">{t.programmeDraftNote}</p>
            {session ? (
              <p className="adminSignedIn">
                {t.signedInAs} <strong>{session.email}</strong>
              </p>
            ) : null}
          </div>
          <div className="adminHeaderLinks">
            <Link href={adminHref}>{t.title}</Link>
            <form action="/api/admin/auth/logout" method="POST">
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className="adminSignOutButton">
                {t.signOut}
              </button>
            </form>
            <Link href="/">{t.back}</Link>
          </div>
        </div>

        <section
          className="adminSection adminProgrammeSection"
          aria-labelledby="admin-programme-heading"
        >
          <h2 id="admin-programme-heading" className="visuallyHidden">
            {t.programmeTitle}
          </h2>
          <div
            className="adminProgrammeContent"
            dangerouslySetInnerHTML={{ __html: programmeHtml }}
          />
        </section>
      </div>
    </main>
  );
}
