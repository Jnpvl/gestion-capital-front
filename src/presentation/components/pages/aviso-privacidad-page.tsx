import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { avisoPrivacidadContent } from "@/shared/content";

export function AvisoPrivacidadPageView() {
  const { hero, lastUpdated, sections } = avisoPrivacidadContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-brand-muted">Última actualización: {lastUpdated}</p>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="font-display text-xl font-bold text-brand-gray sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-brand-muted">
                      {paragraph}
                    </p>
                  ))}
                  {"bullets" in section && section.bullets ? (
                    <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-brand-muted">
                      {section.bullets.map((item) => (
                        <li key={item.slice(0, 48)}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {"closing" in section && section.closing ? (
                    <p className="text-base leading-relaxed text-brand-muted">{section.closing}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
