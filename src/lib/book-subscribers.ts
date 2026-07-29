import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export type BookSubscriber = {
  name: string;
  email: string;
  consent: true;
  source: "une-langue-une-vision-du-monde";
};

export type StoredBookSubscriber = BookSubscriber & {
  createdAt: string;
};

export function getBookSubscriberDataDir() {
  return process.env.BOOK_SUBSCRIBER_DATA_DIR?.trim() || path.join(process.cwd(), "data");
}

export function getBookSubscribersFilePath() {
  return path.join(getBookSubscriberDataDir(), "une-langue-une-vision-du-monde-subscribers.jsonl");
}

export async function readBookSubscribers(): Promise<StoredBookSubscriber[]> {
  let raw = "";
  try {
    raw = await readFile(getBookSubscribersFilePath(), "utf8");
  } catch {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const entry = JSON.parse(line) as StoredBookSubscriber;
        return entry?.email ? [entry] : [];
      } catch {
        return [];
      }
    });
}

export async function findBookSubscriberByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return (await readBookSubscribers()).find((entry) => entry.email.toLowerCase() === normalized) ?? null;
}

export async function saveBookSubscriber(subscriber: BookSubscriber) {
  await mkdir(getBookSubscriberDataDir(), { recursive: true });
  const stored: StoredBookSubscriber = { ...subscriber, createdAt: new Date().toISOString() };
  await appendFile(getBookSubscribersFilePath(), `${JSON.stringify(stored)}\n`, "utf8");
  return stored;
}

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function validateBookSubscriber(body: Record<string, unknown>): BookSubscriber | null {
  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true) {
    return null;
  }

  return { name, email, consent: true, source: "une-langue-une-vision-du-monde" };
}

export function getBookSubscriberNotifyRecipients() {
  return (process.env.BOOK_SUBSCRIBER_NOTIFY_EMAILS ?? process.env.BOOKING_NOTIFY_EMAILS ?? "contact@resulam.com")
    .split(/[,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function isBookSubscriberOriginAllowed(origin: string | null) {
  if (!origin) return true;
  const allowed = (process.env.BOOK_SUBSCRIBER_ALLOWED_ORIGINS ?? "http://127.0.0.1:8093,http://localhost:8093")
    .split(/[,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}
