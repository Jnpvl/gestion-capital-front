import type {
  CreateStudentInput,
  StudentDetail,
  StudentEnrollment,
  StudentsListResponse,
  UpdateStudentInput,
} from "@/core/domain/students/types";
import type { AlumnoType } from "@/core/domain/students/alumno-types";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

class StudentsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "StudentsApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/students${path}`, {
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
    throw new StudentsApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
      error?.error?.details,
    );
  }

  return data as T;
}

export async function listStudents(
  token: string,
  params?: { search?: string; active?: boolean; alumnoType?: AlumnoType; page?: number; limit?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.active !== undefined) query.set("active", String(params.active));
  if (params?.alumnoType) query.set("alumnoType", params.alumnoType);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return request<StudentsListResponse>(qs ? `?${qs}` : "", token);
}

export async function getStudent(token: string, id: string) {
  return request<{ student: StudentDetail; enrollments: StudentEnrollment[] }>(
    `/${id}`,
    token,
  );
}

export async function createStudent(token: string, input: CreateStudentInput) {
  return request<{ student: StudentDetail }>("", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateStudent(
  token: string,
  id: string,
  input: UpdateStudentInput,
) {
  return request<{ student: StudentDetail }>(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateStudentStatus(token: string, id: string, active: boolean) {
  return request<{ student: StudentDetail }>(`/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function assignCourseToStudent(
  token: string,
  studentId: string,
  courseId: string,
  enrolledViaCompany = false,
  deliveryMode: "online" | "presencial" = "online",
) {
  return request<{ enrollment: StudentEnrollment }>(`/${studentId}/enrollments`, token, {
    method: "POST",
    body: JSON.stringify({ courseId, enrolledViaCompany, deliveryMode }),
  });
}

export async function markStudentEnrollmentCompleted(
  token: string,
  studentId: string,
  enrollmentId: string,
) {
  return request<{ enrollment: StudentEnrollment }>(
    `/${studentId}/enrollments/${enrollmentId}/complete`,
    token,
    { method: "PATCH" },
  );
}

export async function revokeStudentEnrollment(
  token: string,
  studentId: string,
  enrollmentId: string,
) {
  return request<{ enrollment: StudentEnrollment }>(
    `/${studentId}/enrollments/${enrollmentId}`,
    token,
    { method: "DELETE" },
  );
}

export { StudentsApiError };
