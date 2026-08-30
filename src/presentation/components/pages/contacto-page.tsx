import { ContactForm } from "@/presentation/components/pages/contact-form";
import { PageHero } from "@/presentation/components/pages/page-hero";
import { PageSection } from "@/presentation/components/pages/page-section";
import { contactoContent } from "@/shared/content";

export function ContactoPageView() {
  const { hero, channels, form, schedule } = contactoContent;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <PageSection variant="light">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <div className="space-y-6">
              {channels.map((channel) => (
                <article key={channel.title}>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
                    {channel.title}
                  </h2>
                  {"href" in channel && channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-1 block text-base font-medium text-brand-gray transition-colors hover:text-brand-blue"
                      {...(channel.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-base font-medium text-brand-gray">{channel.value}</p>
                  )}
                  <p className="mt-1 text-sm text-brand-muted">{channel.description}</p>
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-brand-line bg-white p-6">
              <h2 className="font-display text-lg font-bold text-brand-gray">{schedule.title}</h2>
              <ul className="mt-4 space-y-2">
                {schedule.items.map((item) => (
                  <li key={item} className="text-sm text-brand-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-brand-line bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-brand-gray">{form.title}</h2>
              <p className="mt-2 text-sm text-brand-muted">{form.description}</p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
