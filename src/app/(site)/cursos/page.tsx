import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/presentation/components/ui/container";
import { SectionLabel } from "@/presentation/components/ui/section-label";
import { CourseCard } from "@/presentation/components/courses/course-card";
import { fetchPublicCourses } from "@/infrastructure/http/courses-public-api";
import { createPageMetadata } from "@/shared/config/page-metadata";

export const metadata: Metadata = createPageMetadata(
  "/cursos",
  "Cursos de capacitación",
  "Programas de capacitación en capital humano, cumplimiento y desarrollo organizacional.",
);

export default async function CursosPage() {
  const courses = await fetchPublicCourses();

  return (
    <>
      <section className="border-b border-brand-line bg-brand-light py-16 sm:py-20">
        <Container>
          <SectionLabel>Capacitación</SectionLabel>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-brand-gray sm:text-5xl">
            Cursos para fortalecer tu organización
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-muted">
            Conoce nuestros programas de formación. Solicita información para inscribir a tu equipo.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-line bg-brand-light/40 p-12 text-center">
              <p className="text-brand-muted">Próximamente publicaremos nuestros cursos.</p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline"
              >
                Contáctanos para más información
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
