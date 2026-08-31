import Link from "next/link";
import { Container } from "@/presentation/components/ui/container";
import { SectionLabel } from "@/presentation/components/ui/section-label";
import { CourseCard } from "@/presentation/components/courses/course-card";
import { fetchFeaturedCourses } from "@/infrastructure/http/courses-public-api";

export async function FeaturedCoursesSection() {
  const courses = await fetchFeaturedCourses();

  if (courses.length === 0) return null;

  return (
    <section className="bg-brand-light py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Cursos</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-gray sm:text-4xl">
            Capacitación para tu equipo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-muted">
            Programas diseñados para fortalecer el talento y el cumplimiento en tu organización.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            Ver todos los cursos
          </Link>
        </div>
      </Container>
    </section>
  );
}
