import { PageCta } from "@/presentation/components/pages/page-cta";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { quienesSomosContent } from "@/shared/content";

export function QuienesSomosPageView() {
  const { hero, whoWeAre, mission, vision, values, story } = quienesSomosContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            {whoWeAre.title}
          </h2>
          <div className="mt-6 space-y-4">
            {whoWeAre.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-brand-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection variant="light">
        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-xl border border-brand-line bg-white p-8">
            <h2 className="font-display text-xl font-bold text-brand-blue">{mission.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted sm:text-base">
              {mission.description}
            </p>
          </article>
          <article className="rounded-xl border border-brand-line bg-white p-8">
            <h2 className="font-display text-xl font-bold text-brand-blue">{vision.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted sm:text-base">
              {vision.description}
            </p>
          </article>
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            Nuestros valores
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-xl border border-brand-line p-6 transition-colors hover:border-brand-blue/30"
            >
              <h3 className="font-display text-lg font-bold text-brand-gray">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{value.description}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection variant="light">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            {story.title}
          </h2>
          <div className="mt-6 space-y-4">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-brand-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </PageSection>

      <PageCta />
    </>
  );
}
