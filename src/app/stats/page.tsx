import Link from "next/link";
import { statsContent } from "@/lib/content";
import { getLanguageStats, isStatsAccessGranted } from "@/lib/language-stats";
import { getLocale } from "@/lib/locale";

export default async function StatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; key?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = statsContent[locale];

  if (!isStatsAccessGranted(params?.key)) {
    return (
      <main className="statsPage">
        <div className="statsShell">
          <h1>{t.title}</h1>
          <p className="statsDenied">{t.denied}</p>
          <Link href="/">{t.back}</Link>
        </div>
      </main>
    );
  }

  const stats = await getLanguageStats();
  const maxCount = stats.languages[0]?.count ?? 1;

  return (
    <main className="statsPage">
      <div className="statsShell">
        <div className="statsHeader">
          <div>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <Link href="/">{t.back}</Link>
        </div>

        <div className="statsSummary">
          <span>{t.totalBookings}</span>
          <strong>{stats.totalBookings}</strong>
        </div>

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
