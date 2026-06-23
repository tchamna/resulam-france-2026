"use client";

import { useEffect } from "react";
import { scrollToNextSection } from "@/lib/section-scroll";

const IDLE_SCROLL_MS = 10_000;

export function IdleAutoScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let lastActivity = Date.now();

    const markUserActivity = () => {
      lastActivity = Date.now();
    };

    const userEvents: Array<keyof WindowEventMap> = [
      "wheel",
      "touchstart",
      "touchmove",
      "mousedown",
      "keydown",
      "pointerdown",
    ];

    userEvents.forEach((event) => {
      window.addEventListener(event, markUserActivity, { passive: true });
    });

    const interval = window.setInterval(() => {
      const idle = Date.now() - lastActivity >= IDLE_SCROLL_MS;
      if (!idle) {
        return;
      }

      scrollToNextSection("smooth");
    }, IDLE_SCROLL_MS);

    return () => {
      window.clearInterval(interval);
      userEvents.forEach((event) => {
        window.removeEventListener(event, markUserActivity);
      });
    };
  }, []);

  return null;
}
