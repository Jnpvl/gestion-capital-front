import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  StudentCourseDetailResponse,
  StudentCoursesListResponse,
} from "@/core/domain/student/types";
import { env } from "@/shared/config/env";

class StudentCoursesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StudentCoursesApiError";
  }
}

async function request<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/student/courses${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new StudentCoursesApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listStudentCourses(token: string) {
  return request<StudentCoursesListResponse>("", token);
}

export async function getStudentCourse(token: string, slug: string) {
  return request<StudentCourseDetailResponse>(`/${slug}`, token);
}

export { StudentCoursesApiError };
