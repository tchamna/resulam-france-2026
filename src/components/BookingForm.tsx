"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { VenueNotice, type VenueNoticeCopy } from "@/components/VenueNotice";
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
  sending: string;
  success: string;
  error: string;
  seatsLabel: string;
  seatsAvailable: string;
  seatsLeft: string;
  seatsLeftOne: string;
  soldOut: string;
  soldOutIntro: string;
  duplicate: string;
  fullError: string;
  validationError: string;
};

type Availability = {
  capacity: number;
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
  venueNotice,
  locale,
  initialAvailability,
  variant = "flyer",
}: {
  copy: Copy;
  venueNotice: VenueNoticeCopy;
  locale: "en" | "fr";
  initialAvailability: Availability;
  variant?: DesignVariant;
}) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (availability.full) return;

    const formElement = event.currentTarget;
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

      let data: Availability & { error?: string; ok?: boolean } = {
        capacity: availability.capacity,
        booked: availability.booked,
        remaining: availability.remaining,
        full: availability.full,
      };

      try {
        data = (await response.json()) as typeof data;
      } catch {
        throw new Error("invalid_response");
      }

      if (!response.ok) {
        setStatus("error");
        if (data.error === "duplicate") {
          setMessage(copy.duplicate);
        } else if (data.error === "full") {
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
      setStatus("success");
      setMessage(formatSuccess(copy, data.remaining));
      formElement.reset();
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  }

  const disabled = availability.full || status === "sending";

  return (
    <aside
      className={variant === "midnight" ? "booking bookingCard bookingCardMidnight" : "booking bookingCard"}
      id="book"
    >
      <div className="seatsPanel" aria-live="polite">
        <div className="seatsPanelHead">
          <span className="seatsLabel">{copy.seatsLabel}</span>
          <strong className="seatsCount">
            {availability.full
              ? copy.soldOut
              : formatSeats(copy, availability.remaining, availability.capacity)}
          </strong>
        </div>
        <div className="seatsSkyline" aria-hidden="true">
          <Image
            src="/landing/seats-frieze.png"
            alt=""
            width={1024}
            height={559}
            className="seatsFriezeImage"
            sizes="(max-width: 640px) 100vw, 440px"
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
      <p className="status">{availability.full ? copy.soldOutIntro : copy.intro}</p>

      <div className="bookingVenueNotice">
        <svg className="bookingVenuePin" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="10" r="2.5" fill="currentColor" />
        </svg>
        <VenueNotice {...venueNotice} highlighted={status === "success"} />
      </div>

      <form className="form" onSubmit={submit}>
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
          {availability.full ? copy.soldOut : status === "sending" ? copy.sending : copy.button}
        </button>
        <p
          className={`status ${status === "error" ? "statusError" : status === "success" ? "statusSuccess" : ""}`}
          aria-live="polite"
        >
          {message}
        </p>
      </form>
    </aside>
  );
}
