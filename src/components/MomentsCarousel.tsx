"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MomentSlide } from "@/lib/content";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

type MomentsCarouselProps = {
  slides: MomentSlide[];
  eyebrow?: string;
  title?: string;
  titleId?: string;
};

export function MomentsCarousel({ slides, eyebrow, title, titleId }: MomentsCarouselProps) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const slide = slides[index];
  const total = slides.length;

  function goTo(nextIndex: number) {
    setIndex(((nextIndex % total) + total) % total);
  }

  useEffect(() => {
    const video = videoRef.current;
    video?.pause();
  }, [index, slide.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, video, iframe")) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => (current - 1 + total) % total);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => (current + 1) % total);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  const controls = (
    <div className="momentsControls">
      <button
        type="button"
        className="momentsArrow"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
      >
        ←
      </button>
      <span className="momentsCounter" aria-live="polite">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        className="momentsArrow"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );

  return (
    <div className="momentsCarousel">
      {title ? (
        <div className="momentsHead">
          <div>
            {eyebrow ? <p className="midnightEyebrow">{eyebrow}</p> : null}
            <h2 id={titleId}>{title}</h2>
          </div>
          {controls}
        </div>
      ) : (
        <div className="momentsHead momentsHeadControlsOnly">{controls}</div>
      )}

      <div className="momentsStage" aria-live="polite">
        <div className="momentsMediaFrame" key={slide.id}>
          {slide.kind === "video" ? (
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              poster={slide.poster}
              className="momentsMedia"
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : slide.kind === "youtube" ? (
            <YouTubeEmbed url={slide.src} title={slide.alt} className="momentsMedia momentsYoutube" />
          ) : (
            <div className="momentsBook">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 860px) 100vw, 960px"
                className="momentsMedia"
              />
            </div>
          )}
        </div>

        <div className="momentsCaption">
          <strong>{slide.label}</strong>
          <span>{slide.meta}</span>
        </div>
      </div>

      <div className="momentsDots" role="tablist" aria-label="Carousel slides">
        {slides.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={dotIndex === index}
            aria-label={`Slide ${dotIndex + 1}: ${item.label}`}
            className={dotIndex === index ? "momentsDot isActive" : "momentsDot"}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}
