import { ButtonLink } from "@/presentation/components/ui/button-link";
import { CtaSection } from "@/presentation/components/home/cta-section";

interface PageCtaProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  showDefault?: boolean;
}

export function PageCta({
  title,
  description,
  primaryLabel,
  primaryHref,
  showDefault = true,
}: PageCtaProps) {
  if (showDefault && !title) {
    return <CtaSection />;
  }

  return (
    <section className="bg-brand-blue py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-white/75">{description}</p>
        )}
        {primaryLabel && primaryHref && (
          <div className="mt-6">
            <ButtonLink href={primaryHref} variant="primary" size="lg">
              {primaryLabel}
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
