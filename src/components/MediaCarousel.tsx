"use client";

import { useEffect, useRef, useState } from "react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { getMomentSlides, type MomentSlide, type PageCopy } from "@/lib/content";
import { dispatchMediaFocus } from "@/lib/media-focus";
import { parseYouTubeUrl } from "@/lib/youtube";

type YouTubeSlide = {
  title: string;
  url: string;
  label: string;
};

type ActiveMedia = {
  kind: "video" | "youtube";
  src: string;
  title: string;
};

function youtubeThumbnail(url: string) {
  const video = parseYouTubeUrl(url);
  if (!video) return null;
  return `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
}

function YouTubeCarouselSlide({
  slide,
  onOpen,
}: {
  slide: YouTubeSlide;
  onOpen: (slide: YouTubeSlide) => void;
}) {
  const thumbnail = youtubeThumbnail(slide.url);

  return (
    <div className="carouselItem carouselYoutube">
      <button
        type="button"
        className="youtubePreviewButton"
        onClick={() => onOpen(slide)}
        aria-label={`Watch ${slide.title}`}
      >
        {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : null}
        <i className="youtubePlayMark" aria-hidden="true">
          <svg viewBox="0 0 68 48" focusable="false">
            <path d="M45 24 27 14v20z" />
          </svg>
        </i>
      </button>
      <span>{slide.label}</span>
    </div>
  );
}

function VideoCarouselSlide({
  slide,
  openInModal,
  onOpen,
}: {
  slide: MomentSlide;
  openInModal: boolean;
  onOpen: (slide: MomentSlide) => void;
}) {
  if (openInModal) {
    return (
      <div className="carouselItem carouselVideo">
        <button
          type="button"
          className="youtubePreviewButton"
          onClick={() => onOpen(slide)}
          aria-label={`Watch ${slide.label}`}
        >
          <video preload="metadata" muted playsInline poster={slide.poster}>
            <source src={slide.src} type="video/mp4" />
          </video>
          <i className="youtubePlayMark" aria-hidden="true">
            <svg viewBox="0 0 68 48" focusable="false">
              <path d="M45 24 27 14v20z" />
            </svg>
          </i>
        </button>
        <span>{slide.label}</span>
      </div>
    );
  }

  return (
    <div className="carouselItem carouselVideo">
      <video controls playsInline preload="metadata">
        <source src={slide.src} type="video/mp4" />
      </video>
      <span>{slide.label}</span>
    </div>
  );
}

function CarouselItems({
  slides,
  openLocalVideosInModal,
  onOpenYoutube,
  onOpenVideo,
}: {
  slides: MomentSlide[];
  openLocalVideosInModal: boolean;
  onOpenYoutube: (slide: YouTubeSlide) => void;
  onOpenVideo: (slide: MomentSlide) => void;
}) {
  return (
    <>
      {slides.map((slide) => {
        if (slide.kind === "video") {
          return (
            <VideoCarouselSlide
              key={slide.id}
              slide={slide}
              openInModal={openLocalVideosInModal}
              onOpen={onOpenVideo}
            />
          );
        }

        if (slide.kind === "youtube") {
          return (
            <YouTubeCarouselSlide
              key={slide.id}
              slide={{ title: slide.alt, url: slide.src, label: slide.label }}
              onOpen={onOpenYoutube}
            />
          );
        }

        return null;
      })}
    </>
  );
}

type MediaCarouselProps = {
  t: PageCopy;
  showTitle?: boolean;
  className?: string;
  eyebrow?: string;
  title?: string;
  titleId?: string;
  openLocalVideosInModal?: boolean;
};

export function MediaCarousel({
  t,
  showTitle = true,
  className = "flyerCarousel",
  eyebrow,
  title,
  titleId,
  openLocalVideosInModal = false,
}: MediaCarouselProps) {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);
  const slides = getMomentSlides(t);
  const carouselLabel = title ?? t.mediaTitle;

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
    if (!activeMedia) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMedia(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeMedia]);

  function openYoutube(slide: YouTubeSlide) {
    dispatchMediaFocus();
    setActiveMedia({ kind: "youtube", src: slide.url, title: slide.title });
  }

  function openVideo(slide: MomentSlide) {
    dispatchMediaFocus();
    setActiveMedia({ kind: "video", src: slide.src, title: slide.alt });
  }

  return (
    <div className={className} aria-label={carouselLabel}>
      <div className="carouselHeader">
        {title ? (
          <div>
            {eyebrow ? <p className="midnightEyebrow">{eyebrow}</p> : null}
            <h2 id={titleId}>{title}</h2>
          </div>
        ) : showTitle ? (
          <p>{t.mediaTitle}</p>
        ) : (
          <span aria-hidden="true" />
        )}
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
          <CarouselItems
            slides={slides}
            openLocalVideosInModal={openLocalVideosInModal}
            onOpenYoutube={openYoutube}
            onOpenVideo={openVideo}
          />
          <CarouselItems
            slides={slides}
            openLocalVideosInModal={openLocalVideosInModal}
            onOpenYoutube={openYoutube}
            onOpenVideo={openVideo}
          />
        </div>
      </div>
      {activeMedia ? (
        <div
          className="youtubeWatchModal"
          role="dialog"
          aria-modal="true"
          aria-label={activeMedia.title}
          onClick={() => setActiveMedia(null)}
        >
          <div className="youtubeWatchPanel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="youtubeWatchClose"
              onClick={() => setActiveMedia(null)}
              aria-label="Close video"
            >
              x
            </button>
            {activeMedia.kind === "video" ? (
              <video controls autoPlay playsInline className="youtubeWatchFrame" src={activeMedia.src} />
            ) : (
              <YouTubeEmbed
                url={activeMedia.src}
                title={activeMedia.title}
                className="youtubeWatchFrame"
                autoplay
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
