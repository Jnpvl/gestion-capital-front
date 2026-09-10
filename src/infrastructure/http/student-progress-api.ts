import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  CourseProgressResponse,
  SaveCourseProgressInput,
} from "@/core/domain/student/progress.types";
import { env } from "@/shared/config/env";

class StudentProgressApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StudentProgressApiError";
  }
}

async function request<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/student/courses${path}`, {
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
    throw new StudentProgressApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function getCourseProgress(token: string, slug: string) {
  return request<CourseProgressResponse>(`/${slug}/progress`, token);
}

export async function saveCourseProgress(
  token: string,
  slug: string,
  input: SaveCourseProgressInput,
) {
  return request<CourseProgressResponse>(`/${slug}/progress`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function submitAssignment(
  token: string,
  slug: string,
  blockId: string,
  file: File,
  studentComment?: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  if (studentComment?.trim()) {
    formData.append("studentComment", studentComment.trim());
  }

  const response = await fetch(
    `${env.apiUrl}/api/student/courses/${slug}/assignments/${blockId}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new StudentProgressApiError(
      error?.error?.message ?? "No se pudo enviar la tarea",
      response.status,
      error?.error?.code,
    );
  }

  return data as CourseProgressResponse;
}

export { StudentProgressApiError };
