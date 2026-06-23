import type { DesignVariant } from "@/lib/design";
import { DESIGN_VARIANTS, buildPageHref } from "@/lib/design";

type DesignSwitcherProps = {
  locale: string;
  design: DesignVariant;
};

const designLabels: Record<DesignVariant, string> = {
  flyer: "Flyer",
  midnight: "Midnight",
};

export function DesignSwitcher({ locale, design }: DesignSwitcherProps) {
  return (
    <div className="themeSwitcher" aria-label="Theme switcher">
      {DESIGN_VARIANTS.map((variant) =>
        variant === design ? (
          <span key={variant} className="themeOption isActive" aria-current="page">
            {designLabels[variant]}
          </span>
        ) : (
          <a key={variant} href={buildPageHref(locale, variant)} className="themeOption">
            {designLabels[variant]}
          </a>
        )
      )}
    </div>
  );
}
