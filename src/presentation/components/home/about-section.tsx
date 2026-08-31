import { AboutVideo } from "@/presentation/components/home/about-video";
import { Container } from "@/presentation/components/ui/container";
import { SectionLabel } from "@/presentation/components/ui/section-label";
import { homeContent } from "@/shared/content";

export function AboutSection() {
  const { about, video } = homeContent;

  return (
    <section aria-labelledby="about-heading" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-gray">
              {video.src ? (
                <AboutVideo src={video.src} />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-white/70">
                  Video no disponible
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionLabel>Sobre nosotros</SectionLabel>
            <h2
              id="about-heading"
              className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-gray sm:text-4xl"
            >
              {about.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-brand-muted sm:text-lg">
              {about.paragraphs[0]}
            </p>
            <div className="mt-6 space-y-4 border-t border-brand-line pt-6">
              {about.paragraphs.slice(1).map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-brand-muted sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
