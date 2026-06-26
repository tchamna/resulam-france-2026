export type DesignVariant = "flyer" | "midnight" | "heritage";

export const DEFAULT_DESIGN: DesignVariant = "midnight";

export const DESIGN_VARIANTS: DesignVariant[] = ["flyer", "midnight"];

export function getDesign(design?: string): DesignVariant {
  if (design === "midnight" || design === "flyer") {
    return design;
  }

  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_DESIGN;
  if (envDefault === "midnight" || envDefault === "flyer") {
    return envDefault;
  }

  return DEFAULT_DESIGN;
}

export function buildPageHref(locale: string, design: DesignVariant): string {
  const params = new URLSearchParams();
  if (locale !== "en") params.set("lang", locale);
  if (design !== DEFAULT_DESIGN) params.set("design", design);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
