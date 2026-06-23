import { content } from "@/lib/content";
import type { DesignVariant } from "@/lib/design";
import { DESIGN_VARIANTS, buildPageHref } from "@/lib/design";
import type { Locale } from "@/lib/locale";

type DesignSwitcherProps = {
  locale: Locale;
  design: DesignVariant;
};

export function DesignSwitcher({ locale, design }: DesignSwitcherProps) {
  const labels = content[locale];

  return (
    <div className="themeSwitcher" aria-label="Theme switcher">
      {DESIGN_VARIANTS.map((variant) =>
        variant === design ? (
          <span key={variant} className="themeOption isActive" aria-current="page">
            {variant === "flyer" ? labels.designFlyer : labels.designMidnight}
          </span>
        ) : (
          <a key={variant} href={buildPageHref(locale, variant)} className="themeOption">
            {variant === "flyer" ? labels.designFlyer : labels.designMidnight}
          </a>
        )
      )}
    </div>
  );
}
