import { CONTACT_EMAIL, type PageCopy } from "@/lib/content";

type HeroContactPromptProps = {
  t: PageCopy;
  className?: string;
};

export function HeroContactPrompt({ t, className = "heroContactPrompt" }: HeroContactPromptProps) {
  return (
    <p className={className}>
      {t.heroContactBefore}
      <a href={`mailto:${CONTACT_EMAIL}`}>{t.heroContactLink}</a>
      {t.heroContactAfter}
    </p>
  );
}
