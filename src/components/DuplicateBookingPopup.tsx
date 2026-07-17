"use client";

import { useEffect, useId, useRef } from "react";
import type { DesignVariant } from "@/lib/design";

function modalClassName(variant: DesignVariant): string {
  const base = "bookstorePopupModal duplicateBookingPopupModal";
  if (variant === "midnight") {
    return `${base} bookstorePopupModalMidnight duplicateBookingPopupModalMidnight`;
  }
  if (variant === "heritage") {
    return `${base} bookstorePopupModalHeritage duplicateBookingPopupModalHeritage`;
  }
  return base;
}

export function DuplicateBookingPopup({
  open,
  onClose,
  title,
  message,
  okLabel,
  variant = "flyer",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  okLabel: string;
  variant?: DesignVariant;
}) {
  const titleId = useId();
  const messageId = useId();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    okRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={modalClassName(variant)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClick={onClose}
    >
      <div
        className="bookstorePopupPanel duplicateBookingPopupPanel"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="duplicateBookingPopupBadge" aria-hidden="true">
          !
        </p>
        <h2 id={titleId} className="bookstorePopupTitle duplicateBookingPopupTitle">
          {title}
        </h2>
        <p id={messageId} className="bookstorePopupMessage duplicateBookingPopupMessage">
          {message}
        </p>
        <button
          ref={okRef}
          type="button"
          className="duplicateBookingPopupOk"
          onClick={onClose}
        >
          {okLabel}
        </button>
      </div>
    </div>
  );
}
