import { env } from "@/shared/config/env";

function isCourseUploadPath(path: string): boolean {
  return (
    path.startsWith("/uploads/") ||
    path.startsWith("/images/cursos/") ||
    path.startsWith("/files/cursos/")
  );
}

function normalizeCourseUploadPath(path: string): string {
  if (path.startsWith("/uploads/")) return path;
  return `/uploads${path}`;
}

/** Resolves course assets stored on the API; leaves site static files unchanged. */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (isCourseUploadPath(path)) {
    const base = env.apiUrl.replace(/\/$/, "");
    return `${base}${normalizeCourseUploadPath(path)}`;
  }

  return path;
}
