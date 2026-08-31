import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  CourseDetail,
  CourseSection,
  CoursesListResponse,
} from "@/core/domain/courses/types";
import { env } from "@/shared/config/env";

class CoursesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "CoursesApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/courses${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listCourses(
  token: string,
  params?: { search?: string; status?: "draft" | "published"; page?: number; limit?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return request<CoursesListResponse>(qs ? `?${qs}` : "", token);
}

export async function getCourse(token: string, id: string) {
  return request<{ course: CourseDetail }>(`/${id}`, token);
}

export async function createCourse(token: string, title: string) {
  return request<{ course: CourseDetail }>("", token, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateCoursePromotion(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<{ course: CourseDetail }>(`/${id}/promotion`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCourseContent(token: string, id: string, sections: CourseSection[]) {
  return request<{ course: CourseDetail }>(`/${id}/content`, token, {
    method: "PUT",
    body: JSON.stringify({
      sections: sections.map((section, sectionIndex) => ({
        title: section.title,
        sortOrder: sectionIndex,
        lessons: section.lessons.map((lesson, lessonIndex) => ({
          title: lesson.title,
          sortOrder: lessonIndex,
          blocks: lesson.blocks.map((block, blockIndex) => ({
            type: block.type,
            title: block.title,
            content: block.content,
            resourceUrl: block.resourceUrl,
            sortOrder: blockIndex,
          })),
        })),
      })),
    }),
  });
}

export { CoursesApiError };
