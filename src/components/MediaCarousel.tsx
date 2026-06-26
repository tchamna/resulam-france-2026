"use client";

import { useEffect, useRef } from "react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import type { PageCopy } from "@/lib/content";

const literacyVideos = [
  {
    title: "(Basaa-Cameroun) - Alphabetisation en langues africaines",
    url: "https://www.youtube.com/watch?v=UotEdTkPrBk",
  },
  {
    title: "(Ewondo-BetiFang) - Alphabetisation en langues africaines",
    url: "https://www.youtube.com/watch?v=VD7cGtU5rfU",
  },
  {
    title: "(Bamileke-Nufi) - Alphabetisation en langues africaines",
    url: "https://www.youtube.com/watch?v=XRrEKXUwny4",
  },
  {
    title: "(Bamileke-Ghomala') - Alphabetisation en langues africaines",
    url: "https://www.youtube.com/watch?v=FtGEI6UHM9o",
  },
  {
    title: "(Duala-Douala) - Alphabetisation en langues africaines",
    url: "https://www.youtube.com/watch?v=ddwGaTng6xo",
  },
];

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
      {literacyVideos.map((video) => (
        <div className="carouselItem carouselYoutube" key={video.url}>
          <YouTubeEmbed url={video.url} title={video.title} />
          <span>{video.title}</span>
        </div>
      ))}
    </>
  );
}

type MediaCarouselProps = {
  t: PageCopy;
  showTitle?: boolean;
  className?: string;
};

export function MediaCarousel({ t, showTitle = true, className = "flyerCarousel" }: MediaCarouselProps) {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  function scrollBySlide(direction: -1 | 1) {
    const mask = maskRef.current;
    const slide = mask?.querySelector<HTMLElement>(".carouselItem");
    if (!mask || !slide) return;

    const gap = Number.parseFloat(getComputedStyle(mask).getPropertyValue("--carousel-gap")) || 14;
    const amount = slide.getBoundingClientRect().width + gap;
    const loopPoint = mask.scrollWidth / 2;

    if (direction > 0 && mask.scrollLeft >= loopPoint) {
      mask.scrollLeft -= loopPoint;
    }

    if (direction < 0 && mask.scrollLeft <= amount) {
      mask.scrollLeft += loopPoint;
    }

    pausedRef.current = true;
    mask.scrollBy({ left: amount * direction, behavior: "smooth" });
    window.setTimeout(() => {
      pausedRef.current = false;
    }, 3000);
  }

  useEffect(() => {
    const mask = maskRef.current;
    if (!mask) return;

    let frame = 0;

    function tick() {
      if (!mask) return;

      if (!pausedRef.current) {
        const loopPoint = mask.scrollWidth / 2;
        mask.scrollLeft += 0.45;

        if (mask.scrollLeft >= loopPoint) {
          mask.scrollLeft -= loopPoint;
        }
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={className} aria-label={t.mediaTitle}>
      <div className="carouselHeader">
        {showTitle ? <p>{t.mediaTitle}</p> : <span aria-hidden="true" />}
        <div className="carouselControls" aria-label="Carousel controls">
          <button type="button" className="carouselButton" onClick={() => scrollBySlide(-1)} aria-label="Previous slide">
            ←
          </button>
          <button type="button" className="carouselButton" onClick={() => scrollBySlide(1)} aria-label="Next slide">
            →
          </button>
        </div>
      </div>
      <div
        className="carouselMask"
        ref={maskRef}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocusCapture={() => {
          pausedRef.current = true;
        }}
        onBlurCapture={() => {
          pausedRef.current = false;
        }}
      >
        <div className="carouselTrack">
          <CarouselItems t={t} />
          <CarouselItems t={t} />
        </div>
      </div>
    </div>
  );
}
