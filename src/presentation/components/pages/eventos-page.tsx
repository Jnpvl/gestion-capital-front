import { ButtonLink } from "@/presentation/components/ui/button-link";
import { PageCta } from "@/presentation/components/pages/page-cta";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { EventCard } from "@/presentation/components/events/event-card";
import type { EventPublicItem } from "@/core/domain/events/types";
import { eventosContent } from "@/shared/content";

interface EventosPageViewProps {
  events: EventPublicItem[];
}

export function EventosPageView({ events }: EventosPageViewProps) {
  const { hero, subscribe } = eventosContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        {events.length === 0 ? (
          <p className="text-center text-sm text-brand-muted">
            Pronto publicaremos nuevos eventos y capacitaciones.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-xl rounded-2xl border border-brand-line bg-brand-light p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold text-brand-gray">{subscribe.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            {subscribe.description}
          </p>
          <h3 className="mt-6 font-display text-lg font-bold text-brand-gray">
            {subscribe.communityTitle}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
            {subscribe.communityDescription}
          </p>
          <div className="mt-6">
            <ButtonLink href={subscribe.ctaHref} variant="primary" size="lg">
              {subscribe.ctaLabel}
            </ButtonLink>
          </div>
        </div>
      </PageSection>

      <PageCta />
    </>
  );
}
