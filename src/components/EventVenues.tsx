"use client";

import { useId, useState } from "react";
import type { PageCopy } from "@/lib/content";

type Venue = PageCopy["venues"][number];
type VenueDetail = Venue["details"][number];

type AccessStep = {
  text: string;
  hint?: string;
};

type AccessRoute = {
  mode: "metro" | "bus";
  line: string;
  title: string;
  steps: ReadonlyArray<AccessStep>;
};

type EventVenuesProps = {
  t: PageCopy;
  variant?: "flyer" | "midnight" | "heritage";
};

function detailLabel(t: PageCopy, detail: VenueDetail) {
  return t.venueDetailLabels[detail.label];
}

function getMapsUrl(venue: Venue): string | null {
  if (!("mapsUrl" in venue) || typeof venue.mapsUrl !== "string" || !venue.mapsUrl) {
    return null;
  }
  return venue.mapsUrl;
}

function getAccessRoutes(venue: Venue): AccessRoute[] | null {
  if (!("accessRoutes" in venue) || !Array.isArray(venue.accessRoutes)) {
    return null;
  }
  const routes = venue.accessRoutes as AccessRoute[];
  return routes.length > 0 ? routes : null;
}

type VenueCardProps = {
  venue: Venue;
  t: PageCopy;
};

function VenueCard({ venue, t }: VenueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const mapsUrl = getMapsUrl(venue);
  const accessRoutes = getAccessRoutes(venue);

  function toggleExpanded() {
    setExpanded((open) => !open);
  }

  return (
    <article
      className={`venueCard ${expanded ? "venueCard-isExpanded" : "venueCard-isCollapsed"}`}
    >
      <div className="venueCardHead">
        <span>{venue.date}</span>
        <strong>{venue.time}</strong>
      </div>

      <h3 className="venueCardTitle">
        <button
          type="button"
          className="venueCardToggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={toggleExpanded}
        >
          <span>{venue.name}</span>
          <span
            className={`venueToggleIcon ${expanded ? "venueToggleIcon-isOpen" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div className="venueCardPreview">
        {"description" in venue && venue.description ? (
          <p className="venueDescription">{venue.description}</p>
        ) : null}
        <p className="venueAddress">
          <span>{t.venueDetailLabels.address}</span>
          {venue.address}
        </p>
        {mapsUrl || (!expanded && accessRoutes) ? (
          <div className="venuePreviewActions">
            {mapsUrl ? (
              <a
                className="venueMapsLink"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.venueDetailLabels.openMaps}
              </a>
            ) : null}
            {!expanded && accessRoutes ? (
              <button type="button" className="venueExpandAction" onClick={toggleExpanded}>
                {t.venueDetailLabels.showDirections}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div id={bodyId} className="venueCardBody">
          {accessRoutes ? (
            <div className="venueAccess">
              <p className="venueAccessTitle">{t.venueDetailLabels.getThere}</p>
              <ul className="venueAccessRoutes">
                {accessRoutes.map((route) => (
                  <li key={route.title} className={`venueAccessRoute venueAccessRoute-${route.mode}`}>
                    <div className="venueAccessRouteHead">
                      <span
                        className={`venueAccessBadge venueAccessBadge-line-${route.line}`}
                        aria-hidden="true"
                      >
                        {route.line}
                      </span>
                      <strong>{route.title}</strong>
                    </div>
                    <ol className="venueAccessSteps">
                      {route.steps.map((step) => (
                        <li key={step.text}>
                          <span className="venueAccessStepText">{step.text}</span>
                          {step.hint ? <span className="venueAccessHint">{step.hint}</span> : null}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {venue.details.length > 0 ? (
            <dl className="venueDetails">
              {venue.details.map((detail) => (
                <div key={`${detail.label}-${detail.text}`}>
                  <dt>{detailLabel(t, detail)}</dt>
                  <dd>{detail.text}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <button type="button" className="venueExpandAction" onClick={toggleExpanded}>
            {t.venueDetailLabels.hideDirections}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function EventVenues({ t, variant = "flyer" }: EventVenuesProps) {
  return (
    <section className={`eventVenues eventVenues-${variant} scrollSection`} aria-labelledby="venues-title">
      <div className="eventVenuesHeader">
        <p>{t.venuesIntro}</p>
        <h2 id="venues-title">{t.venuesTitle}</h2>
      </div>

      <div className="venueGrid">
        {t.venues.map((venue) => (
          <VenueCard
            key={`${venue.date}-${venue.address}`}
            venue={venue}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
