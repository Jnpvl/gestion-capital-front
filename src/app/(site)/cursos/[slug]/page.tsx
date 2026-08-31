import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/presentation/components/ui/container";
import { fetchPublicCourseBySlug } from "@/infrastructure/http/courses-public-api";
import {
  DEFAULT_COVER_IMAGE,
  MODALITY_LABELS,
  type CourseModality,
} from "@/core/domain/courses/types";
import { siteConfig } from "@/shared/content/site";
import { seoConfig } from "@/shared/config/seo";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchPublicCourseBySlug(slug);

  if (!course) {
    return { title: "Curso no encontrado" };
  }

  const title = course.title;
  const description = course.shortDescription ?? course.description ?? title;
  const url = `${seoConfig.siteUrl}/cursos/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${seoConfig.defaultTitle}`,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await fetchPublicCourseBySlug(slug);

  if (!course) notFound();

  const modality =
    course.modality && course.modality in MODALITY_LABELS
      ? MODALITY_LABELS[course.modality as CourseModality]
      : course.modality;

  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(
    `Hola, me interesa el curso "${course.title}". ¿Podrían darme más información?`,
  )}`;

  return (
    <>
      <section className="relative overflow-hidden border-b border-brand-line bg-brand-gray text-white">
        <div className="absolute inset-0">
          <Image
            src={resolveAssetUrl(course.coverImage) || DEFAULT_COVER_IMAGE}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <Container className="relative py-16 sm:py-24">
          {modality && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {modality}
            </span>
          )}
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {course.title}
          </h1>
          {course.shortDescription && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
              {course.shortDescription}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            {course.duration && <span>Duración: {course.duration}</span>}
            {course.level && <span>Nivel: {course.level}</span>}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {course.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">Sobre el curso</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-brand-muted">
                    {course.description}
                  </p>
                </div>
              )}

              {course.highlights.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">Lo que aprenderás</h2>
                  <ul className="mt-4 space-y-3">
                    {course.highlights.map((item) => (
                      <li key={item} className="flex gap-3 text-brand-muted">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-black" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-light p-6">
              <h2 className="font-display text-xl font-bold text-brand-gray">¿Te interesa?</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                Escríbenos y te ayudamos con fechas, modalidad e inscripción para tu equipo.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/contacto"
                  className="inline-flex justify-center rounded-lg bg-brand-black px-4 py-3 text-sm font-semibold text-white hover:bg-brand-gray"
                >
                  Solicitar información
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-lg border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-gray hover:bg-white/80"
                >
                  WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
