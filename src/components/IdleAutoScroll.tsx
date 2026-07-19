"use client";

import { useEffect, useRef } from "react";

const SCROLL_SPEED = 0.45;
const END_PAUSE_MS = 30_000;

export function IdleAutoScroll() {
  const autoCycleRef = useRef(true);
  const endPauseUntilRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    function breakAutoCycle() {
      if (!autoCycleRef.current) return;
      autoCycleRef.current = false;
      endPauseUntilRef.current = 0;
    }

    const breakEvents: Array<keyof WindowEventMap> = [
      "click",
      "pointerdown",
      "pointerover",
      "wheel",
      "touchstart",
      "touchmove",
      "keydown",
      "focusin",
    ];

    breakEvents.forEach((event) => {
      window.addEventListener(event, breakAutoCycle, { passive: true, capture: true });
    });

    function getMaxScrollTop() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    let frame = 0;

    function tick() {
      if (autoCycleRef.current) {
        const now = performance.now();
        const maxScroll = getMaxScrollTop();

        if (maxScroll > 0) {
          if (endPauseUntilRef.current > now) {
            window.scrollTo(0, maxScroll);
          } else {
            const atBottom = window.scrollY >= maxScroll - 1;

            if (endPauseUntilRef.current !== 0) {
              window.scrollTo(0, 0);
              endPauseUntilRef.current = 0;
            } else if (atBottom) {
              window.scrollTo(0, maxScroll);
              endPauseUntilRef.current = now + END_PAUSE_MS;
            } else {
              window.scrollTo(0, window.scrollY + SCROLL_SPEED);
            }
          }
        }
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      breakEvents.forEach((event) => {
        window.removeEventListener(event, breakAutoCycle, { capture: true });
      });
    };
  }, []);

  return null;
}
