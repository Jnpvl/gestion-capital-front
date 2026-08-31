import type {
  CoursePublicCard,
  CoursePublicDetail,
} from "@/core/domain/courses/types";
import { env } from "@/shared/config/env";

const REVALIDATE_SECONDS = 60;

async function publicFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    // Durante el build (p. ej. Vercel) el API puede no estar disponible.
    return fallback;
  }
}

export async function fetchPublicCourses(): Promise<CoursePublicCard[]> {
  const data = await publicFetch<{ courses: CoursePublicCard[] }>("/api/courses", {
    courses: [],
  });
  return data.courses;
}

export async function fetchFeaturedCourses(): Promise<CoursePublicCard[]> {
  const data = await publicFetch<{ courses: CoursePublicCard[] }>("/api/courses/featured", {
    courses: [],
  });
  return data.courses;
}

export async function fetchPublicCourseBySlug(
  slug: string,
): Promise<CoursePublicDetail | null> {
  const data = await publicFetch<{ course: CoursePublicDetail } | null>(
    `/api/courses/${slug}`,
    null,
  );
  return data?.course ?? null;
}
