"use client";

import { useEffect } from "react";
import { getNextSectionScrollTop, scrollToNextSection } from "@/lib/section-scroll";

const IDLE_SCROLL_MS = 10_000;
const END_PAUSE_MS = 30_000;

export function IdleAutoScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let autoCycleActive = true;
    let lastActivity = Date.now();
    let endPauseActive = false;
    let endPauseTimeout = 0;

    const markUserActivity = () => {
      lastActivity = Date.now();
    };

    const breakAutoCycle = () => {
      if (!autoCycleActive) return;
      autoCycleActive = false;
      endPauseActive = false;
      if (endPauseTimeout !== 0) {
        window.clearTimeout(endPauseTimeout);
        endPauseTimeout = 0;
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "wheel",
      "touchstart",
      "touchmove",
      "mousedown",
      "keydown",
      "pointerdown",
    ];

    const breakEvents: Array<keyof DocumentEventMap> = ["click", "pointerover"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, markUserActivity, { passive: true });
    });

    breakEvents.forEach((event) => {
      document.addEventListener(event, breakAutoCycle, { passive: true, capture: true });
    });

    function isAtEndOfSections() {
      const nextTop = getNextSectionScrollTop();
      return nextTop === 0 && window.scrollY > 100;
    }

    const interval = window.setInterval(() => {
      if (!autoCycleActive || endPauseActive) {
        return;
      }

      const idle = Date.now() - lastActivity >= IDLE_SCROLL_MS;
      if (!idle) {
        return;
      }

      if (isAtEndOfSections()) {
        endPauseActive = true;
        endPauseTimeout = window.setTimeout(() => {
          endPauseTimeout = 0;
          if (!autoCycleActive) {
            endPauseActive = false;
            return;
          }
          endPauseActive = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
          lastActivity = Date.now();
        }, END_PAUSE_MS);
        return;
      }

      scrollToNextSection("smooth");
    }, IDLE_SCROLL_MS);

    return () => {
      window.clearInterval(interval);
      if (endPauseTimeout !== 0) {
        window.clearTimeout(endPauseTimeout);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, markUserActivity);
      });
      breakEvents.forEach((event) => {
        document.removeEventListener(event, breakAutoCycle, { capture: true });
      });
    };
  }, []);

  return null;
}
