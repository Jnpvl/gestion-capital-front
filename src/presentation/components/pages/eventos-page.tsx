import { ButtonLink } from "@/presentation/components/ui/button-link";
import { PageCta } from "@/presentation/components/pages/page-cta";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { eventosContent } from "@/shared/content";

export function EventosPageView() {
  const { hero, upcoming, subscribe } = eventosContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        <div className="grid gap-6 lg:grid-cols-3">
          {upcoming.map((event) => (
            <article
              key={event.title}
              className="flex flex-col rounded-xl border border-brand-line bg-white p-8"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {event.type}
                </span>
                <span className="text-xs text-brand-muted">{event.modality}</span>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-brand-gray">
                {event.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-brand-gold">{event.date}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">
                {event.description}
              </p>
            </article>
          ))}
        </div>
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
