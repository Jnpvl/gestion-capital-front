import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePublicView } from "@/presentation/components/courses/course-public-view";
import { fetchPublicCourseBySlug } from "@/infrastructure/http/courses-public-api";
import {
  EMPTY_OBJECTIVES,
  EMPTY_PARTICIPANT_PROFILE,
  normalizeObjectives,
  normalizeParticipantProfile,
  normalizeSyllabus,
} from "@/core/domain/courses/types";
import { seoConfig } from "@/shared/config/seo";

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

  return (
    <CoursePublicView
      course={{
        ...course,
        participantProfile: normalizeParticipantProfile(
          course.participantProfile ?? EMPTY_PARTICIPANT_PROFILE,
        ),
        objectives: normalizeObjectives(course.objectives ?? EMPTY_OBJECTIVES),
        syllabus: normalizeSyllabus(course.syllabus ?? []),
        highlights: course.highlights ?? [],
      }}
    />
  );
}
