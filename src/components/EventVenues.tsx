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

export function EventVenues({ t, variant = "flyer" }: EventVenuesProps) {
  return (
    <section className={`eventVenues eventVenues-${variant} scrollSection`} aria-labelledby="venues-title">
      <div className="eventVenuesHeader">
        <p>{t.venuesIntro}</p>
        <h2 id="venues-title">{t.venuesTitle}</h2>
      </div>

      <div className="venueGrid">
        {t.venues.map((venue) => {
          const mapsUrl = getMapsUrl(venue);
          const accessRoutes = getAccessRoutes(venue);

          return (
            <article className="venueCard" key={`${venue.date}-${venue.address}`}>
              <div className="venueCardHead">
                <span>{venue.date}</span>
                <strong>{venue.time}</strong>
              </div>
              <h3>{venue.name}</h3>
              {"description" in venue && venue.description ? (
                <p className="venueDescription">{venue.description}</p>
              ) : null}
              <p className="venueAddress">
                <span>{t.venueDetailLabels.address}</span>
                {venue.address}
              </p>
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
              {accessRoutes ? (
                <div className="venueAccess">
                  <p className="venueAccessTitle">{t.venueDetailLabels.getThere}</p>
                  <ul className="venueAccessRoutes">
                    {accessRoutes.map((route) => (
                      <li key={route.title} className={`venueAccessRoute venueAccessRoute-${route.mode}`}>
                        <div className="venueAccessRouteHead">
                          <span className="venueAccessBadge" aria-hidden="true">
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
