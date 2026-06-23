import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  teaching: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 42c8-10 18-14 28-14 6 0 11 1 16 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 46c4-6 10-9 17-9 4 0 8 1 12 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y="24" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M21 24v-6h6v6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M45 18h6M48 15v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  adults: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="18" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 52c2-10 8-16 14-16s12 6 14 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="40" y="30" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M43 34h8M43 39h8M43 44h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="47" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 16h14v36H16a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M28 16h14a4 4 0 0 1 4 4v28H28V16z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M36 16v36" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 24h8M18 30h8M18 36h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  apps: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="18" width="24" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="34" y="24" width="20" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="40" y="12" width="12" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 42h12M22 36v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  usb: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="24" y="18" width="16" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M28 18v-6h8v6M32 12v-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y="28" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="42" y="28" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 36h48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  ),
  surprises: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="28" width="36" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 34h36M32 28V50" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 28c-8-8-16-6-16 0s8 8 16 0 16-8 16 0-8 8-16 0z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="32" y="43" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">?</text>
    </svg>
  ),
};

export type BenefitItem = {
  id: string;
  title: string;
  text: string;
};

type DiscoverGridProps = {
  title: string;
  intro: string;
  items: readonly BenefitItem[];
};

export function DiscoverGrid({ title, intro, items }: DiscoverGridProps) {
  return (
    <div className="discoverPanel">
      <h2>{title}</h2>
      <p className="discoverIntro">{intro}</p>
      <div className="discoverGrid">
        {items.map((item) => (
          <article className="discoverCard" key={item.id}>
            <div className="discoverIcon">{icons[item.id] ?? icons.surprises}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
