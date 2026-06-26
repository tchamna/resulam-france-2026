"use client";

import { useEffect, useRef, useState } from "react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import type { PageCopy } from "@/lib/content";
import { parseYouTubeUrl } from "@/lib/youtube";

type YouTubeSlide = {
  title: string;
  url: string;
  label: string;
};

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

function youtubeThumbnail(url: string) {
  const video = parseYouTubeUrl(url);
  if (!video) return null;
  return `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
}

function YouTubeCarouselSlide({ slide, onOpen }: { slide: YouTubeSlide; onOpen: (slide: YouTubeSlide) => void }) {
  const thumbnail = youtubeThumbnail(slide.url);

  return (
    <div className="carouselItem carouselYoutube">
      <button type="button" className="youtubePreviewButton" onClick={() => onOpen(slide)} aria-label={`Watch ${slide.title}`}>
        {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : null}
        <i className="youtubePlayMark" aria-hidden="true">&#9658;</i>
      </button>
      <span>{slide.label}</span>
    </div>
  );
}

function CarouselItems({ t, onOpenYoutube }: { t: PageCopy; onOpenYoutube: (slide: YouTubeSlide) => void }) {
  const youtubeSlides: YouTubeSlide[] = [
    {
      title: "Resulam Nufi cartoon preview",
      url: "https://www.youtube.com/watch?v=rr2nlVF7kgE&t=55s",
      label: t.cartoons,
    },
    {
      title: "Resulam African language cartoon preview",
      url: "https://www.youtube.com/watch?v=xusm6BsMVWg",
      label: t.cartoons,
    },
    ...literacyVideos.map((video) => ({ ...video, label: video.title })),
  ];

  return (
    <>
      <div className="carouselItem carouselVideo">
        <video controls playsInline preload="metadata">
          <source src="/landing/pangop-temoignage-nufi-1.mp4" type="video/mp4" />
        </video>
        <span>{t.testimony}</span>
      </div>
      {youtubeSlides.map((slide) => (
        <YouTubeCarouselSlide slide={slide} onOpen={onOpenYoutube} key={slide.url} />
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
  const [activeYoutube, setActiveYoutube] = useState<YouTubeSlide | null>(null);

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

  useEffect(() => {
    if (!activeYoutube) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveYoutube(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeYoutube]);

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
          <CarouselItems t={t} onOpenYoutube={setActiveYoutube} />
          <CarouselItems t={t} onOpenYoutube={setActiveYoutube} />
        </div>
      </div>
      {activeYoutube ? (
        <div className="youtubeWatchModal" role="dialog" aria-modal="true" aria-label={activeYoutube.title} onClick={() => setActiveYoutube(null)}>
          <div className="youtubeWatchPanel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="youtubeWatchClose" onClick={() => setActiveYoutube(null)} aria-label="Close video">
              x
            </button>
            <YouTubeEmbed
              url={activeYoutube.url}
              title={activeYoutube.title}
              className="youtubeWatchFrame"
              autoplay
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
