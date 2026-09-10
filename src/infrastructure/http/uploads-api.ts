import type { CourseAssetKind } from "@/core/domain/courses/types";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

class UploadApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "UploadApiError";
  }
}

export async function uploadCourseAsset(
  token: string,
  courseId: string,
  file: File,
  kind: CourseAssetKind,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch(`${env.apiUrl}/api/admin/uploads/course/${courseId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new UploadApiError(
      error?.error?.message ?? "No se pudo subir el archivo",
      response.status,
      error?.error?.code,
    );
  }

  return (data as { path: string }).path;
}

export async function uploadStaffPhoto(
  token: string,
  staffId: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${env.apiUrl}/api/admin/uploads/staff/${staffId}/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new UploadApiError(
      error?.error?.message ?? "No se pudo subir la fotografía",
      response.status,
      error?.error?.code,
    );
  }

  return (data as { path: string }).path;
}

export async function uploadStaffLogo(
  token: string,
  staffId: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${env.apiUrl}/api/admin/uploads/staff/${staffId}/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new UploadApiError(
      error?.error?.message ?? "No se pudo subir el logo",
      response.status,
      error?.error?.code,
    );
  }

  return (data as { path: string }).path;
}

export async function uploadStaffSignature(
  token: string,
  staffId: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${env.apiUrl}/api/admin/uploads/staff/${staffId}/signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new UploadApiError(
      error?.error?.message ?? "No se pudo subir la firma",
      response.status,
      error?.error?.code,
    );
  }

  return (data as { path: string }).path;
}

export { UploadApiError };
