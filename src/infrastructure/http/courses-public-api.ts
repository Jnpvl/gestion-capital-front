import type {
  CoursePublicCard,
  CoursePublicDetail,
} from "@/core/domain/courses/types";
import { env } from "@/shared/config/env";

export async function fetchPublicCourses(): Promise<CoursePublicCard[]> {
  const response = await fetch(`${env.apiUrl}/api/courses`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: CoursePublicCard[] };
  return data.courses;
}

export async function fetchFeaturedCourses(): Promise<CoursePublicCard[]> {
  const response = await fetch(`${env.apiUrl}/api/courses/featured`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: CoursePublicCard[] };
  return data.courses;
}

export async function fetchPublicCourseBySlug(
  slug: string,
): Promise<CoursePublicDetail | null> {
  const response = await fetch(`${env.apiUrl}/api/courses/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { course: CoursePublicDetail };
  return data.course;
}
