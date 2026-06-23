import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./designs/midnight.css";
import "./designs/heritage.css";

export const metadata: Metadata = {
  title: "Resulam France 2026",
  description:
    "Free Resulam conference in France on August 9, 2026, for families who want to learn and teach their mother tongue.",
  openGraph: {
    title: "Resulam France 2026",
    description:
      "Book your free place for the Resulam mother-tongue learning conference in France.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

async function getLocale(): Promise<"en" | "fr"> {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
