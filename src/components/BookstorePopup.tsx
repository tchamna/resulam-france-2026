"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { BOOKSTORE_IMAGES } from "@/components/BookstoreBanner";
import { AFRICAN_LANGUAGE_LIBRARY_URL } from "@/lib/content";
import type { DesignVariant } from "@/lib/design";

type BookstorePopupCopy = {
  bookstorePopupTitle: string;
  bookstorePopupMessage: string;
  bookstorePopupClose: string;
  bookstoreLinkLabel: string;
  bookstoreAltNufi: string;
  bookstoreAltEwondo: string;
};

function popupClassName(variant: DesignVariant): string {
  if (variant === "midnight") return "bookstorePopupModal bookstorePopupModalMidnight";
  if (variant === "heritage") return "bookstorePopupModal bookstorePopupModalHeritage";
  return "bookstorePopupModal";
}

export function BookstorePopup({
  open,
  onClose,
  copy,
  variant = "flyer",
}: {
  open: boolean;
  onClose: () => void;
  copy: BookstorePopupCopy;
  variant?: DesignVariant;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const altByKey = {
    bookstoreAltNufi: copy.bookstoreAltNufi,
    bookstoreAltEwondo: copy.bookstoreAltEwondo,
  } as const;

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={popupClassName(variant)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className="bookstorePopupPanel" onClick={(event) => event.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="bookstorePopupClose"
          onClick={onClose}
          aria-label={copy.bookstorePopupClose}
        >
          ×
        </button>
        <h2 id={titleId} className="bookstorePopupTitle">
          {copy.bookstorePopupTitle}
        </h2>
        <p className="bookstorePopupMessage">{copy.bookstorePopupMessage}</p>
        <div className="bookstoreGrid">
          {BOOKSTORE_IMAGES.map(({ src, altKey }) => (
            <a
              key={src}
              href={AFRICAN_LANGUAGE_LIBRARY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bookstoreLink"
              aria-label={copy.bookstoreLinkLabel}
            >
              <Image
                src={src}
                alt={altByKey[altKey]}
                width={1200}
                height={800}
                className="bookstoreImage"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
