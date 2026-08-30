import Image from "next/image";
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={video.posterImage}
                alt="Sesión de capacitación empresarial con participantes"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-brand-gray/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
                  <svg className="ml-1 h-6 w-6 text-brand-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
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
              {about.description}
            </p>
            <ul className="mt-8 space-y-3 border-t border-brand-line pt-8">
              {about.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-brand-gray sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
