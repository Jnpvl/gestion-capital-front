import type { CourseAssetKind } from "@/core/domain/courses/types";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";
import {
  resolveUploadErrorMessage,
  validateUploadFile,
  type UploadKind,
} from "@/shared/lib/upload-validation";

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

function assertClientFile(file: File, kind: UploadKind) {
  const validationError = validateUploadFile(file, kind);
  if (validationError) {
    throw new UploadApiError(validationError, 400, "CLIENT_VALIDATION");
  }
}

async function parseUploadFailure(
  response: Response,
  fallback: string,
): Promise<UploadApiError> {
  const data = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return new UploadApiError(
    resolveUploadErrorMessage(response.status, data, fallback),
    response.status,
    data?.error?.code,
  );
}

/** Normalize to a managed /uploads/... path when possible. */
function toManagedUploadPath(path?: string | null): string | null {
  if (!path?.trim()) return null;
  let normalized = path.trim().split("?")[0];

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      normalized = new URL(normalized).pathname;
    } catch {
      return null;
    }
  }

  if (normalized.startsWith("/images/") || normalized.startsWith("/files/")) {
    normalized = `/uploads${normalized}`;
  }

  return normalized.startsWith("/uploads/") ? normalized : null;
}

async function postFile(
  url: string,
  token: string,
  file: File,
  fallbackError: string,
  previousPath?: string | null,
): Promise<{ path: string; replaced: boolean }> {
  const managedPrevious = toManagedUploadPath(previousPath);
  const formData = new FormData();
  // Text fields BEFORE the file so Multer/Busboy always parses them.
  if (managedPrevious) {
    formData.append("previousPath", managedPrevious);
  }
  formData.append("file", file);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (managedPrevious) {
    headers["X-Previous-Upload-Path"] = managedPrevious;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw await parseUploadFailure(response, fallbackError);
  }

  const data = (await response.json()) as { path: string; replaced?: boolean };
  return { path: data.path, replaced: Boolean(data.replaced) };
}

export async function uploadCourseAsset(
  token: string,
  courseId: string,
  file: File,
  kind: CourseAssetKind,
  previousPath?: string | null,
  options?: { role?: "cover" },
): Promise<string> {
  assertClientFile(file, kind);

  const params = new URLSearchParams({ kind });
  if (options?.role) params.set("role", options.role);
  const managedPrevious = toManagedUploadPath(previousPath);
  if (managedPrevious) params.set("previousPath", managedPrevious);

  const { path } = await postFile(
    `${env.apiUrl}/api/admin/uploads/course/${courseId}?${params.toString()}`,
    token,
    file,
    "No se pudo subir el archivo",
    managedPrevious,
  );

  // Always remove the previous file from the client so cleanup does not depend on Multer.
  if (managedPrevious && managedPrevious !== path) {
    await deleteUploadedAsset(token, managedPrevious).catch(() => undefined);
  }

  return path;
}

export async function deleteUploadedAsset(
  token: string,
  filePath: string,
  options?: {
    role?: "cover" | "photo" | "logo" | "signature";
    courseId?: string;
    staffId?: string;
  },
): Promise<void> {
  const managedPath = toManagedUploadPath(filePath);
  if (!managedPath) {
    throw new UploadApiError(
      "No se pudo resolver la ruta del archivo para eliminarlo",
      400,
      "INVALID_UPLOAD_PATH",
    );
  }

  const params = new URLSearchParams({ path: managedPath });
  if (options?.role) params.set("role", options.role);
  if (options?.courseId) params.set("courseId", options.courseId);
  if (options?.staffId) params.set("staffId", options.staffId);

  const response = await fetch(`${env.apiUrl}/api/admin/uploads?${params.toString()}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: managedPath,
      role: options?.role,
      courseId: options?.courseId,
      staffId: options?.staffId,
    }),
  });

  if (!response.ok) {
    throw await parseUploadFailure(response, "No se pudo eliminar el archivo");
  }
}

export async function uploadStaffPhoto(
  token: string,
  staffId: string,
  file: File,
  previousPath?: string | null,
): Promise<string> {
  assertClientFile(file, "image");

  const managedPrevious = toManagedUploadPath(previousPath);
  const params = new URLSearchParams();
  if (managedPrevious) params.set("previousPath", managedPrevious);
  const qs = params.toString();

  const { path } = await postFile(
    `${env.apiUrl}/api/admin/uploads/staff/${staffId}/photo${qs ? `?${qs}` : ""}`,
    token,
    file,
    "No se pudo subir la fotografía",
    managedPrevious,
  );

  if (managedPrevious && managedPrevious !== path) {
    await deleteUploadedAsset(token, managedPrevious).catch(() => undefined);
  }

  return path;
}

export async function uploadStaffLogo(
  token: string,
  staffId: string,
  file: File,
  previousPath?: string | null,
): Promise<string> {
  assertClientFile(file, "image");

  const managedPrevious = toManagedUploadPath(previousPath);
  const params = new URLSearchParams();
  if (managedPrevious) params.set("previousPath", managedPrevious);
  const qs = params.toString();

  const { path } = await postFile(
    `${env.apiUrl}/api/admin/uploads/staff/${staffId}/logo${qs ? `?${qs}` : ""}`,
    token,
    file,
    "No se pudo subir el logo",
    managedPrevious,
  );

  if (managedPrevious && managedPrevious !== path) {
    await deleteUploadedAsset(token, managedPrevious).catch(() => undefined);
  }

  return path;
}

export async function uploadStaffSignature(
  token: string,
  staffId: string,
  file: File,
  previousPath?: string | null,
): Promise<string> {
  assertClientFile(file, "image");

  const managedPrevious = toManagedUploadPath(previousPath);
  const params = new URLSearchParams();
  if (managedPrevious) params.set("previousPath", managedPrevious);
  const qs = params.toString();

  const { path } = await postFile(
    `${env.apiUrl}/api/admin/uploads/staff/${staffId}/signature${qs ? `?${qs}` : ""}`,
    token,
    file,
    "No se pudo subir la firma",
    managedPrevious,
  );

  if (managedPrevious && managedPrevious !== path) {
    await deleteUploadedAsset(token, managedPrevious).catch(() => undefined);
  }

  return path;
}

export { UploadApiError };
