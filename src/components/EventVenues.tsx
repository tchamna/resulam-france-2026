import type { PageCopy } from "@/lib/content";

type VenueDetail = PageCopy["venues"][number]["details"][number];

type EventVenuesProps = {
  t: PageCopy;
  variant?: "flyer" | "midnight" | "heritage";
};

function detailLabel(t: PageCopy, detail: VenueDetail) {
  return t.venueDetailLabels[detail.label];
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
          <article className="venueCard" key={`${venue.date}-${venue.address}`}>
            <div className="venueCardHead">
              <span>{venue.date}</span>
              <strong>{venue.time}</strong>
            </div>
            <h3>{venue.name}</h3>
            <p className="venueAddress">
              <span>{t.venueDetailLabels.address}</span>
              {venue.address}
            </p>
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
        ))}
      </div>
    </section>
  );
}
