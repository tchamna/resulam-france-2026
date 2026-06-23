export type VenueNoticeCopy = {
  title: string;
  body: string;
};

type VenueNoticeProps = VenueNoticeCopy & {
  highlighted?: boolean;
};

export function VenueNotice({ title, body, highlighted = false }: VenueNoticeProps) {
  return (
    <aside
      className={highlighted ? "venueNotice venueNoticeHighlighted" : "venueNotice"}
      aria-label={title}
    >
      <strong>{title}</strong>
      <p>{body}</p>
    </aside>
  );
}
