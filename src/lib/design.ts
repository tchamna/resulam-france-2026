export type DesignVariant = "flyer" | "midnight";

export const DESIGN_VARIANTS: DesignVariant[] = ["flyer", "midnight"];

export function getDesign(design?: string): DesignVariant {
  if (design === "midnight" || design === "flyer") {
    return design;
  }

  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_DESIGN;
  if (envDefault === "midnight" || envDefault === "flyer") {
    return envDefault;
  }

  return "flyer";
}

export function buildPageHref(locale: string, design: DesignVariant): string {
  const params = new URLSearchParams();
  if (locale !== "en") params.set("lang", locale);
  if (design !== "flyer") params.set("design", design);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
