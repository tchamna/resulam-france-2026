"use client";

import { useState } from "react";

type Copy = {
  title: string;
  intro: string;
  name: string;
  email: string;
  phone: string;
  optional: string;
  button: string;
  sending: string;
  success: string;
  error: string;
};

export function BookingForm({ copy, locale }: { copy: Copy; locale: "en" | "fr" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = new FormData(event.currentTarget);
    const payload = {
      locale,
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Booking failed");
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <aside className="booking" id="book">
      <h2>{copy.title}</h2>
      <p className="status">{copy.intro}</p>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">{copy.name}</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="email">{copy.email}</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">
            {copy.phone} <span aria-hidden="true">({copy.optional})</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <button className="submit" type="submit" disabled={status === "sending"}>
          {status === "sending" ? copy.sending : copy.button}
        </button>
        <p className={`status ${status === "error" ? "statusError" : ""}`} aria-live="polite">
          {status === "success" ? copy.success : status === "error" ? copy.error : ""}
        </p>
      </form>
    </aside>
  );
}
