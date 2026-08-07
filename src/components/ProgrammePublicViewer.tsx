"use client";

import { useState } from "react";

type ProgrammePublicViewerProps = {
  pdfPath: string;
  htmlContent: string;
  title: string;
  viewerLabel: string;
  tabHtml: string;
  tabPdf: string;
};

export function ProgrammePublicViewer({
  pdfPath,
  htmlContent,
  title,
  viewerLabel,
  tabHtml,
  tabPdf,
}: ProgrammePublicViewerProps) {
  const [view, setView] = useState<"html" | "pdf">("pdf");

  return (
    <section className="programmePublicViewer" aria-label={viewerLabel}>
      <div className="programmePublicTabs" role="tablist" aria-label={viewerLabel}>
        <button
          type="button"
          role="tab"
          id="programme-tab-pdf"
          aria-selected={view === "pdf"}
          aria-controls="programme-panel-pdf"
          className={view === "pdf" ? "programmePublicTab isActive" : "programmePublicTab"}
          onClick={() => setView("pdf")}
        >
          {tabPdf}
        </button>
        <button
          type="button"
          role="tab"
          id="programme-tab-html"
          aria-selected={view === "html"}
          aria-controls="programme-panel-html"
          className={view === "html" ? "programmePublicTab isActive" : "programmePublicTab"}
          onClick={() => setView("html")}
        >
          {tabHtml}
        </button>
      </div>

      {view === "html" ? (
        <div
          id="programme-panel-html"
          role="tabpanel"
          aria-labelledby="programme-tab-html"
          className="programmePublicContent adminProgrammeContent"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <div
          id="programme-panel-pdf"
          role="tabpanel"
          aria-labelledby="programme-tab-pdf"
          className="programmePublicPdfPanel"
        >
          <iframe className="programmePublicFrame" src={pdfPath} title={title} />
        </div>
      )}
    </section>
  );
}
