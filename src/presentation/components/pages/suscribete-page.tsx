import { SubscribeForm } from "@/presentation/components/pages/subscribe-form";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { suscribeteContent } from "@/shared/content";

export function SuscribetePageView() {
  const { hero, benefits } = suscribeteContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-gray">
              ¿Qué recibirás?
            </h2>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-brand-gray sm:text-base">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold"
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-brand-line bg-white p-6 sm:p-8">
            <SubscribeForm />
          </div>
        </div>
      </PageSection>
    </>
  );
}
