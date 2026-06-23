import { headers } from "next/headers";

export type Locale = "en" | "fr";

export async function getLocale(lang?: string): Promise<Locale> {
  if (lang === "fr" || lang === "en") {
    return lang;
  }

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().startsWith("fr") ? "fr" : "en";
}
