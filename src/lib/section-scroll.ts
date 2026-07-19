"use client";

const SECTION_SELECTOR = ".scrollSection";

export function getScrollMarginTop() {
  if (typeof document === "undefined") return 72;

  const banner = document.querySelector(".seatsBanner");
  if (!banner) return 72;
  return banner.getBoundingClientRect().height + 20;
}

export function getScrollSections() {
  if (typeof document === "undefined") return [];

  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter(
    (section) => section.offsetHeight > 0,
  );
}

export function getMaxScrollY() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function isAtDocumentBottom(threshold = 24, currentScrollY = window.scrollY) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  return currentScrollY >= getMaxScrollY() - threshold;
}

export function getNextSectionScrollTop(currentScrollY = window.scrollY) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const sections = getScrollSections();
  if (sections.length === 0) {
    return null;
  }

  const maxScrollY = getMaxScrollY();
  if (isAtDocumentBottom(24, currentScrollY)) {
    return 0;
  }

  const marginTop = getScrollMarginTop();
  const viewportAnchor = currentScrollY + marginTop + 12;

  for (const section of sections) {
    const top = section.getBoundingClientRect().top + window.scrollY - marginTop;
    if (top > viewportAnchor) {
      const nextTop = Math.max(0, top);
      if (nextTop > maxScrollY) {
        return 0;
      }
      return nextTop;
    }
  }

  return 0;
}

export function isAtEndOfScrollSections(
  currentScrollY = window.scrollY,
  options?: { minScrollY?: number; bottomThreshold?: number },
) {
  if (typeof window === "undefined") {
    return false;
  }

  const minScrollY = options?.minScrollY ?? 100;
  if (currentScrollY <= minScrollY) {
    return false;
  }

  const nextTop = getNextSectionScrollTop(currentScrollY);
  const atBottom = isAtDocumentBottom(options?.bottomThreshold ?? 24, currentScrollY);

  return nextTop === 0 || atBottom;
}

export function scrollToNextSection(behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") {
    return;
  }

  const nextTop = getNextSectionScrollTop();
  if (nextTop === null) {
    return;
  }

  window.scrollTo({ top: nextTop, behavior });
}
