const SECTION_SELECTOR = ".scrollSection";

export function getScrollMarginTop() {
  const banner = document.querySelector(".seatsBanner");
  if (!banner) return 72;
  return banner.getBoundingClientRect().height + 20;
}

export function getScrollSections() {
  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter(
    (section) => section.offsetHeight > 0,
  );
}

export function getNextSectionScrollTop(currentScrollY = window.scrollY) {
  const sections = getScrollSections();
  if (sections.length === 0) {
    return null;
  }

  const marginTop = getScrollMarginTop();
  const viewportAnchor = currentScrollY + marginTop + 12;

  for (const section of sections) {
    const top = section.getBoundingClientRect().top + window.scrollY - marginTop;
    if (top > viewportAnchor) {
      return Math.max(0, top);
    }
  }

  return 0;
}

export function scrollToNextSection(behavior: ScrollBehavior = "smooth") {
  const nextTop = getNextSectionScrollTop();
  if (nextTop === null) {
    return;
  }

  window.scrollTo({ top: nextTop, behavior });
}
