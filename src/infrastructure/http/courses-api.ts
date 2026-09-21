import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  AssignmentSubmissionListItem,
} from "@/core/domain/courses/assignment";
import type { CourseDetail, CourseSection, CoursesListResponse } from "@/core/domain/courses/types";
import type { CourseEnrollmentListItem } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
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
  params?: {
    search?: string;
    status?: "draft" | "published";
    instructorId?: string;
    unassigned?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.instructorId) query.set("instructorId", params.instructorId);
  if (params?.unassigned) query.set("unassigned", "true");
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return request<CoursesListResponse>(qs ? `?${qs}` : "", token);
}

export async function getCourse(token: string, id: string) {
  return request<{ course: CourseDetail }>(`/${id}`, token);
}

export async function createCourse(
  token: string,
  title: string,
  options?: { instructorId?: string | null },
) {
  return request<{ course: CourseDetail }>("", token, {
    method: "POST",
    body: JSON.stringify({
      title,
      instructorId: options?.instructorId ?? undefined,
    }),
  });
}

export async function deleteCourse(token: string, id: string) {
  return request<{ ok: true; id: string }>(`/${id}`, token, {
    method: "DELETE",
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
        id: section.id,
        title: section.title,
        sortOrder: sectionIndex,
        isFinalExam: section.isFinalExam ?? false,
        lessons: section.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id,
          title: lesson.title,
          sortOrder: lessonIndex,
          blocks: lesson.blocks.map((block, blockIndex) => ({
            id: block.id,
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

async function fetchCertificatePreviewBlob(
  path: string,
  templateUrl: string | undefined,
  fallbackMessage: string,
): Promise<Blob> {
  const token = authStorage.getToken();
  if (!token) {
    throw new CoursesApiError("No hay sesión activa", 401);
  }

  const query = new URLSearchParams();
  if (templateUrl) query.set("templateUrl", templateUrl);
  const qs = query.toString();
  const response = await fetch(
    `${env.apiUrl}/api/admin/courses${path}${qs ? `?${qs}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? fallbackMessage,
      response.status,
      error?.error?.code,
    );
  }

  return response.blob();
}

export async function fetchCourseCertificatePreview(
  courseId: string,
  templateUrl: string,
): Promise<Blob> {
  return fetchCertificatePreviewBlob(
    `/${courseId}/certificate/preview`,
    templateUrl,
    "No se pudo generar la vista previa",
  );
}

export async function fetchCourseDc3Preview(courseId: string): Promise<Blob> {
  return fetchCertificatePreviewBlob(
    `/${courseId}/certificate/dc3/preview`,
    undefined,
    "No se pudo generar la vista previa",
  );
}

export async function previewCourseCertificate(
  courseId: string,
  templateUrl: string,
  _courseTitle: string,
) {
  const blob = await fetchCourseCertificatePreview(courseId, templateUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vista-previa-constancia.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function previewCourseDc3(courseId: string, _courseTitle: string) {
  const blob = await fetchCourseDc3Preview(courseId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vista-previa-dc3.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function listCourseEnrollments(token: string, courseId: string) {
  return request<{ enrollments: CourseEnrollmentListItem[] }>(`/${courseId}/enrollments`, token);
}

export async function markCourseEnrollmentCompleted(
  token: string,
  courseId: string,
  enrollmentId: string,
) {
  return request<{ enrollment: CourseEnrollmentListItem }>(
    `/${courseId}/enrollments/${enrollmentId}/complete`,
    token,
    { method: "PATCH" },
  );
}

async function downloadEnrollmentPdf(
  courseId: string,
  enrollmentId: string,
  kind: "certificate" | "dc3",
  fallbackName: string,
) {
  const token = authStorage.getToken();
  if (!token) {
    throw new CoursesApiError("No hay sesión activa", 401);
  }

  const suffix = kind === "dc3" ? "/certificate/dc3" : "/certificate";
  const response = await fetch(
    `${env.apiUrl}/api/admin/courses/${courseId}/enrollments/${enrollmentId}${suffix}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? "No se pudo descargar el documento",
      response.status,
      error?.error?.code,
    );
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? fallbackName;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadEnrollmentCertificate(
  courseId: string,
  enrollmentId: string,
  slug: string,
) {
  await downloadEnrollmentPdf(courseId, enrollmentId, "certificate", `constancia-${slug}.pdf`);
}

export async function downloadEnrollmentDc3(
  courseId: string,
  enrollmentId: string,
  slug: string,
) {
  await downloadEnrollmentPdf(courseId, enrollmentId, "dc3", `dc3-${slug}.pdf`);
}

export async function exportCourseCertificatesZip(
  courseId: string,
  options: {
    deliveryMode?: "all" | "online" | "presencial";
    enrollmentIds?: string[];
    kind?: "constancia" | "dc3";
  } = {},
) {
  const token = authStorage.getToken();
  if (!token) {
    throw new CoursesApiError("No hay sesión activa", 401);
  }

  const query = new URLSearchParams();
  const deliveryMode = options.deliveryMode ?? "all";
  const kind = options.kind ?? "constancia";
  if (deliveryMode !== "all") query.set("deliveryMode", deliveryMode);
  if (kind === "dc3") query.set("kind", "dc3");
  if (options.enrollmentIds && options.enrollmentIds.length > 0) {
    query.set("enrollmentIds", options.enrollmentIds.join(","));
  }
  const qs = query.toString();

  const response = await fetch(
    `${env.apiUrl}/api/admin/courses/${courseId}/certificates/export${qs ? `?${qs}` : ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? "No se pudo exportar el ZIP",
      response.status,
      error?.error?.code,
    );
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename =
    match?.[1] ?? (kind === "dc3" ? `dc3-${courseId}.zip` : `constancias-${courseId}.zip`);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface PresencialImportRowResult {
  row: number;
  curp: string;
  studentName: string;
  status: "created" | "reused" | "skipped" | "error";
  studentId?: string;
  enrollmentId?: string;
  certificateNumber?: string;
  message?: string;
}

export interface PresencialImportResult {
  courseId: string;
  totalRows: number;
  createdStudents: number;
  reusedStudents: number;
  issuedCertificates: number;
  errors: number;
  rows: PresencialImportRowResult[];
}

export async function downloadPresencialTemplate(courseId: string) {
  const token = authStorage.getToken();
  if (!token) {
    throw new CoursesApiError("No hay sesión activa", 401);
  }

  const response = await fetch(
    `${env.apiUrl}/api/admin/courses/${courseId}/presencial/template`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? "No se pudo descargar la plantilla",
      response.status,
      error?.error?.code,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla-emision-presencial.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importPresencialExcel(courseId: string, file: File) {
  const token = authStorage.getToken();
  if (!token) {
    throw new CoursesApiError("No hay sesión activa", 401);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${env.apiUrl}/api/admin/courses/${courseId}/presencial/import`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new CoursesApiError(
      error?.error?.message ?? "No se pudo importar el Excel",
      response.status,
      error?.error?.code,
    );
  }

  return data as PresencialImportResult;
}

export async function listCourseAssignments(
  token: string,
  courseId: string,
  status: "pending" | "approved" | "returned" | "all" = "all",
) {
  const query = status === "all" ? "" : `?status=${status}`;
  return request<{ submissions: AssignmentSubmissionListItem[] }>(
    `/${courseId}/assignments${query}`,
    token,
  );
}

export async function reviewCourseAssignment(
  token: string,
  courseId: string,
  submissionId: string,
  input: { status: "approved" | "returned"; reviewerComment?: string | null },
) {
  return request<{ progress: unknown }>(
    `/${courseId}/assignments/${submissionId}/review`,
    token,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export { CoursesApiError };
