import Image from "next/image";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import type { PageCopy } from "@/lib/content";

function CarouselItems({ t }: { t: PageCopy }) {
  return (
    <>
      <div className="carouselItem carouselVideo">
        <video controls playsInline preload="metadata" poster="/landing/nufi-cartoon-presentation.png">
          <source src="/landing/pangop-temoignage-nufi-1.mp4" type="video/mp4" />
        </video>
        <span>{t.testimony}</span>
      </div>
      <div className="carouselItem carouselYoutube">
        <YouTubeEmbed
          url="https://www.youtube.com/watch?v=rr2nlVF7kgE&t=55s"
          title="Resulam Nufi cartoon preview"
        />
        <span>{t.cartoons}</span>
      </div>
      <div className="carouselItem carouselYoutube">
        <YouTubeEmbed
          url="https://www.youtube.com/watch?v=xusm6BsMVWg"
          title="Resulam African language cartoon preview"
        />
        <span>{t.cartoons}</span>
      </div>
      <div className="carouselItem bookSlide">
        <Image src="/landing/african-tales-book.png" alt="African tales in Nufi and French" fill sizes="260px" loading="eager" />
        <span>{t.books}</span>
      </div>
      <div className="carouselItem bookSlide">
        <Image src="/landing/nufi-grammar-book.png" alt="Nufi grammar book and ebook" fill sizes="260px" loading="eager" />
        <span>{t.books}</span>
      </div>
    </>
  );
}

type MediaCarouselProps = {
  t: PageCopy;
  showTitle?: boolean;
  className?: string;
};

export function MediaCarousel({ t, showTitle = true, className = "flyerCarousel" }: MediaCarouselProps) {
  return (
    <div className={className} aria-label={t.mediaTitle}>
      {showTitle ? <p>{t.mediaTitle}</p> : null}
      <div className="carouselMask">
        <div className="carouselTrack">
          <CarouselItems t={t} />
          <CarouselItems t={t} />
        </div>
      </div>
    </div>
  );
}
