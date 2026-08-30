import { ButtonLink } from "@/presentation/components/ui/button-link";
import { Container } from "@/presentation/components/ui/container";
import { homeContent, siteConfig } from "@/shared/content";

export function CtaSection() {
  const { cta } = homeContent;
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(siteConfig.contact.whatsapp.message)}`;

  return (
    <section aria-labelledby="cta-heading" className="bg-brand-blue py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {cta.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={cta.primaryHref} variant="primary" size="lg">
              {cta.primaryLabel}
            </ButtonLink>
            <ButtonLink href={whatsappUrl} variant="inverse" size="lg" external>
              {cta.secondaryLabel}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
