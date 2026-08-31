import Image from "next/image";
import { ButtonLink } from "@/presentation/components/ui/button-link";
import { Container } from "@/presentation/components/ui/container";
import { SectionLabel } from "@/presentation/components/ui/section-label";
import { cn } from "@/shared/lib/cn";
import { homeContent } from "@/shared/content";

export function HeroSection() {
  const { hero, stats } = homeContent;

  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-brand-line bg-white pt-24 pb-16 lg:pt-28 lg:pb-20"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionLabel>{hero.eyebrow}</SectionLabel>

            <h1
              id="hero-heading"
              className="mt-4 font-display text-4xl font-bold leading-[1.12] tracking-tight text-brand-gray sm:text-5xl"
            >
              <span className="text-brand-gold">{hero.headlineHighlight}</span>{" "}
              {hero.headlineRest}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
              {hero.subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={hero.primaryCta.href} variant="primary" size="lg">
                {hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="outline" size="lg">
                {hero.secondaryCta.label}
              </ButtonLink>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.value}
                  className={cn(
                    "flex flex-col justify-center rounded-xl border border-brand-line bg-white px-4 py-4 sm:px-5 sm:py-5",
                    index < 3 ? "min-h-[5.5rem] lg:col-span-2" : "col-span-2 sm:col-span-3 lg:col-span-3",
                  )}
                >
                  <dt className="font-display text-xl font-bold text-brand-blue sm:text-2xl">
                    {stat.value}
                  </dt>
                  {stat.label && (
                    <dd className="mt-1 text-xs font-medium leading-snug text-brand-gray sm:text-sm">
                      {stat.label}
                    </dd>
                  )}
                  {stat.detail && (
                    <dd
                      className={cn(
                        "text-xs leading-relaxed text-brand-muted sm:text-sm",
                        stat.label ? "mt-1.5" : "mt-1.5",
                      )}
                    >
                      {stat.detail}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/6]">
              <Image
                src={hero.backgroundImage}
                alt="Equipo de trabajo en reunión de capacitación empresarial"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div
              className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-2xl bg-brand-blue"
              aria-hidden="true"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
