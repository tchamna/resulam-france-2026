import type { Metadata } from "next";
import Link from "next/link";
import { ProgrammePublicViewer } from "@/components/ProgrammePublicViewer";
import { programmePublicContent } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { readPublicProgrammeHtml } from "@/lib/programme-content";
import { PROGRAMME_PUBLIC_PDF_PATH } from "@/lib/programme-public";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = programmePublicContent[locale];

  return {
    title: `${t.title} | Resulam France 2026`,
    description: t.intro,
  };
}

export default async function ProgrammePublicPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params?.lang);
  const t = programmePublicContent[locale];
  const homeHref = params?.lang ? `/?lang=${params.lang}` : "/";
  const programmeHtml = await readPublicProgrammeHtml();

  return (
    <main className="statsPage programmePublicPage">
      <div className="statsShell programmePublicShell">
        <div className="statsHeader">
          <div>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <div className="adminHeaderLinks">
            <a className="programmePublicDownload" href={PROGRAMME_PUBLIC_PDF_PATH} download>
              {t.download}
            </a>
            <Link href={homeHref}>{t.back}</Link>
          </div>
        </div>

        <ProgrammePublicViewer
          pdfPath={PROGRAMME_PUBLIC_PDF_PATH}
          htmlContent={programmeHtml}
          title={t.title}
          viewerLabel={t.viewerLabel}
          tabHtml={t.tabHtml}
          tabPdf={t.tabPdf}
        />
      </div>
    </main>
  );
}
