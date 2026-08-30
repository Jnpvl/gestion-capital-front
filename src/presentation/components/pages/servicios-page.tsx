import { PageCta } from "@/presentation/components/pages/page-cta";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { serviciosContent } from "@/shared/content";

export function ServiciosPageView() {
  const { hero, categories, process } = serviciosContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        <div className="space-y-16">
          {categories.map((category, index) => (
            <article
              key={category.title}
              className="grid gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <span className="text-sm font-semibold text-brand-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-brand-gray sm:text-3xl">
                  {category.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-brand-muted">
                  {category.description}
                </p>
              </div>
              <ul className={`space-y-3 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-brand-line bg-white px-4 py-3 text-sm text-brand-gray"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            {process.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step) => (
            <article
              key={step.step}
              className="relative rounded-xl border border-brand-line p-6"
            >
              <span className="font-display text-3xl font-bold text-brand-blue/20">
                {step.step}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-brand-gray">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageCta />
    </>
  );
}
