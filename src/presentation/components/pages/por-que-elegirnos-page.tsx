import { PageCta } from "@/presentation/components/pages/page-cta";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { porQueElegirnosContent } from "@/shared/content";

export function PorQueElegirnosPageView() {
  const { hero, reasons, commitments } = porQueElegirnosContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-xl border border-brand-line bg-white p-8 transition-colors hover:border-brand-blue/30"
            >
              <h2 className="font-display text-lg font-bold text-brand-gray">{reason.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            {commitments.title}
          </h2>
          <ul className="mt-10 space-y-4">
            {commitments.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-xl border border-brand-line bg-brand-light px-6 py-4"
              >
                <span
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="text-sm text-brand-gray sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageCta />
    </>
  );
}
