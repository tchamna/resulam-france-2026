"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookstorePopup } from "@/components/BookstorePopup";
import { DuplicateBookingPopup } from "@/components/DuplicateBookingPopup";
import { isFullyBooked, isGroup2Phase } from "@/lib/booking-availability";
import { formatPlacesLeft } from "@/lib/format-places-left";
import type { DesignVariant } from "@/lib/design";

type Copy = {
  title: string;
  intro: string;
  name: string;
  email: string;
  phone: string;
  languages: string;
  languagesPlaceholder: string;
  optional: string;
  button: string;
  buttonWaitlist: string;
  sending: string;
  success: string;
  successWaitlist: string;
  error: string;
  seatsLabel: string;
  seatsAvailable: string;
  seatsLeft: string;
  seatsLeftOne: string;
  group2Badge: string;
  group2BadgeOne: string;
  group2Intro: string;
  group2IntroOne: string;
  waitlistBadge: string;
  soldOut: string;
  soldOutIntro: string;
  duplicate: string;
  duplicateWaitlist: string;
  duplicateResent: string;
  duplicateWaitlistResent: string;
  duplicatePopupTitle: string;
  duplicatePopupOk: string;
  checkSpam: string;
  emailWarning: string;
  fullError: string;
  validationError: string;
};

type BookstorePopupCopy = {
  bookstorePopupTitle: string;
  bookstorePopupMessage: string;
  bookstorePopupClose: string;
  bookstoreLinkLabel: string;
  bookstoreAltNufi: string;
  bookstoreAltEwondo: string;
};

type BookingResponse = Availability & {
  error?: string;
  ok?: boolean;
  duplicate?: boolean;
  waitlist?: boolean;
  email?: { sentGuest?: boolean; sentAdmin?: boolean };
};

type Availability = {
  capacity: number;
  group1Capacity: number;
  booked: number;
  remaining: number;
  full: boolean;
};

function formatSeats(copy: Copy, remaining: number, capacity: number) {
  if (remaining === capacity) {
    return copy.seatsAvailable.replace("{count}", String(remaining));
  }
  if (remaining === 1) {
    return copy.seatsLeftOne;
  }
  return copy.seatsLeft.replace("{count}", String(remaining));
}

function formatSuccess(copy: Copy, remaining: number) {
  if (remaining === 1) {
    return copy.success.replace("{count}", "1");
  }
  return copy.success.replace("{count}", String(remaining));
}

export function BookingForm({
  copy,
  bookstorePopupCopy,
  locale,
  initialAvailability,
  variant = "flyer",
}: {
  copy: Copy;
  bookstorePopupCopy: BookstorePopupCopy;
  locale: "en" | "fr";
  initialAvailability: Availability;
  variant?: DesignVariant;
}) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showBookstorePopup, setShowBookstorePopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicatePopupMessage, setDuplicatePopupMessage] = useState("");
  const [bookstoreAfterDuplicate, setBookstoreAfterDuplicate] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const blockNativeNavigation = (event: Event) => {
      event.preventDefault();
    };

    form.addEventListener("submit", blockNativeNavigation, { capture: true });
    return () => {
      form.removeEventListener("submit", blockNativeNavigation, { capture: true });
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshAvailability() {
      try {
        const response = await fetch("/api/bookings", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Availability;
        if (active) setAvailability(data);
      } catch {
        // Keep server-provided availability if refresh fails.
      }
    }

    refreshAvailability();
    return () => {
      active = false;
    };
  }, []);

  const progress = availability.capacity
    ? Math.min(100, Math.round((availability.booked / availability.capacity) * 100))
    : 0;

  const submitBooking = useCallback(async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    const languages = String(form.get("languages") ?? "").trim();

    if (languages.length < 2) {
      setStatus("error");
      setMessage(copy.validationError);
      return;
    }

    const payload = {
      locale,
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      languages,
    };

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: BookingResponse = {
        capacity: availability.capacity,
        group1Capacity: availability.group1Capacity,
        booked: availability.booked,
        remaining: availability.remaining,
        full: availability.full,
      };

      try {
        data = (await response.json()) as BookingResponse;
      } catch {
        throw new Error("invalid_response");
      }

      if (!response.ok) {
        setStatus("error");
        if (data.error === "full") {
          setAvailability(data);
          setMessage(copy.fullError);
        } else if (data.error === "invalid_booking") {
          setMessage(copy.validationError);
        } else {
          setMessage(copy.error);
        }
        return;
      }

      setAvailability(data);
      const emailSent = data.email?.sentGuest !== false;
      const isWaitlist = Boolean(data.waitlist);

      if (data.duplicate) {
        const duplicateMessage = emailSent
          ? isWaitlist
            ? copy.duplicateWaitlistResent
            : copy.duplicateResent
          : `${isWaitlist ? copy.duplicateWaitlist : copy.duplicate} ${copy.emailWarning}`;
        setStatus(emailSent ? "success" : "error");
        setMessage(duplicateMessage);
        setDuplicatePopupMessage(duplicateMessage);
        setShowDuplicatePopup(true);
        setBookstoreAfterDuplicate(!isWaitlist && emailSent);
        return;
      }

      setStatus(emailSent ? "success" : "error");
      setMessage(
        emailSent
          ? isWaitlist
            ? copy.successWaitlist
            : formatSuccess(copy, data.remaining)
          : `${isWaitlist ? copy.successWaitlist : formatSuccess(copy, data.remaining)} ${copy.emailWarning}`
      );
      if (emailSent && !isWaitlist) setShowBookstorePopup(true);
      formElement.reset();
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  }, [availability, copy, locale]);

  const onFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitBooking(event.currentTarget);
    },
    [submitBooking]
  );

  const disabled = status === "sending";
  const soldOut = isFullyBooked(availability.remaining, availability.full);
  const group2Open = isGroup2Phase(
    availability.booked,
    availability.remaining,
    availability.group1Capacity,
  );

  function formatGroup2Intro() {
    return availability.remaining === 1
      ? copy.group2IntroOne
      : copy.group2Intro.replace("{count}", String(availability.remaining));
  }

  function formatSeatsCount() {
    if (soldOut) return copy.soldOut;
    if (group2Open) {
      return formatPlacesLeft(
        copy,
        availability.remaining,
        availability.full,
        0,
        availability.booked,
        availability.group1Capacity,
      );
    }
    return formatSeats(copy, availability.remaining, availability.capacity);
  }

  function closeDuplicatePopup() {
    setShowDuplicatePopup(false);
    if (bookstoreAfterDuplicate) {
      setBookstoreAfterDuplicate(false);
      setShowBookstorePopup(true);
    }
  }

  return (
    <>
      <DuplicateBookingPopup
        open={showDuplicatePopup}
        onClose={closeDuplicatePopup}
        title={copy.duplicatePopupTitle}
        message={duplicatePopupMessage}
        okLabel={copy.duplicatePopupOk}
        variant={variant}
      />
      <BookstorePopup
        open={showBookstorePopup}
        onClose={() => setShowBookstorePopup(false)}
        copy={bookstorePopupCopy}
        variant={variant}
      />
      <aside
      className={variant === "midnight" ? "booking bookingCard bookingCardMidnight" : "booking bookingCard"}
      id="book"
    >
      <div className="seatsPanel" aria-live="polite">
        <div className="seatsPanelHead">
          <span className="seatsLabel">{copy.seatsLabel}</span>
          <strong className="seatsCount">
            {formatSeatsCount()}
          </strong>
        </div>
        <div className="seatsSkyline" aria-hidden="true">
          <Image
            src="/landing/african-polyglot-children.png"
            alt=""
            width={1686}
            height={948}
            className="seatsArtworkImage"
            sizes="(max-width: 640px) 100vw, 720px"
            priority={variant === "flyer"}
          />
        </div>
        <div
          className="seatsProgressTrack"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={availability.capacity}
          aria-valuenow={availability.booked}
          aria-label={copy.seatsLabel}
        >
          <span className="seatsProgressFill" style={{ width: `${progress}%` }} />
        </div>
        <p className="seatsMeta">
          {availability.booked}/{availability.capacity}
        </p>
      </div>

      <h2>{copy.title}</h2>
      <p className="status">{soldOut ? copy.soldOutIntro : group2Open ? formatGroup2Intro() : copy.intro}</p>

      <form
        ref={formRef}
        className="form"
        action="#book"
        method="post"
        noValidate
        onSubmit={onFormSubmit}
      >
        <div className="formRow">
          <div className="field">
            <label htmlFor="name">{copy.name}</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              disabled={disabled}
            />
          </div>
          <div className="field">
            <label htmlFor="email">{copy.email}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={disabled}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="phone">
            {copy.phone} <span aria-hidden="true">({copy.optional})</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" disabled={disabled} />
        </div>
        <div className="field">
          <label htmlFor="languages">{copy.languages}</label>
          <textarea
            id="languages"
            name="languages"
            required
            minLength={2}
            placeholder={copy.languagesPlaceholder}
            disabled={disabled}
          />
        </div>
        <button className="submit" type="submit" disabled={disabled}>
          {soldOut
            ? status === "sending"
              ? copy.sending
              : copy.buttonWaitlist
            : status === "sending"
              ? copy.sending
              : copy.button}
        </button>
        <p
          className={`status ${status === "error" ? "statusError" : status === "success" ? "statusSuccess" : ""}`}
          aria-live="polite"
        >
          {message}
        </p>
        {status === "success" && (
          <p className="status statusHint" aria-live="polite">
            {copy.checkSpam}
          </p>
        )}
      </form>
    </aside>
    </>
  );
}
