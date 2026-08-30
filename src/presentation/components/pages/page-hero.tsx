import { Container } from "@/presentation/components/ui/container";
import { SectionLabel } from "@/presentation/components/ui/section-label";

interface PageHeroProps {
  label: string;
  title: string;
  description: string;
}

export function PageHero({ label, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-brand-line bg-white pt-28 pb-12 lg:pt-32 lg:pb-16">
      <Container>
        <div className="max-w-3xl">
          <SectionLabel>{label}</SectionLabel>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-gray sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-muted sm:text-lg">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
