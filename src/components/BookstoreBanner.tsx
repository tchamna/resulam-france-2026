import Image from "next/image";
import { AFRICAN_LANGUAGE_LIBRARY_URL, type PageCopy } from "@/lib/content";
import type { DesignVariant } from "@/lib/design";

const BOOKSTORE_IMAGES = [
  {
    src: "/landing/bookstore-nufi-collection.png",
    altKey: "bookstoreAltNufi",
  },
  {
    src: "/landing/bookstore-ewondo-collection.png",
    altKey: "bookstoreAltEwondo",
  },
] as const;

type BookstoreBannerProps = {
  t: PageCopy;
  variant?: DesignVariant;
};

export function BookstoreBanner({ t, variant = "flyer" }: BookstoreBannerProps) {
  const className =
    variant === "midnight"
      ? "bookstoreBanner bookstoreBannerMidnight scrollSection"
      : variant === "heritage"
        ? "bookstoreBanner bookstoreBannerHeritage scrollSection"
        : "bookstoreBanner scrollSection";

  return (
    <section className={className} aria-labelledby="bookstore-title">
      <h2 id="bookstore-title">{t.bookstoreTitle}</h2>
      <p className="bookstoreHint">{t.bookstoreHint}</p>
      <div className="bookstoreGrid">
        {BOOKSTORE_IMAGES.map(({ src, altKey }) => (
          <a
            key={src}
            href={AFRICAN_LANGUAGE_LIBRARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bookstoreLink"
            aria-label={t.bookstoreLinkLabel}
          >
            <Image src={src} alt={t[altKey]} width={1200} height={800} className="bookstoreImage" />
          </a>
        ))}
      </div>
    </section>
  );
}
