import { env } from "@/shared/config/env";

function isApiAssetPath(path: string): boolean {
  return (
    path.startsWith("/uploads/") ||
    path.startsWith("/templates/") ||
    path.startsWith("/images/cursos/") ||
    path.startsWith("/files/cursos/")
  );
}

function normalizeApiAssetPath(path: string): string {
  if (path.startsWith("/uploads/") || path.startsWith("/templates/")) return path;
  return `/uploads${path}`;
}

/** Resolves course assets stored on the API; leaves site static files unchanged. */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (isApiAssetPath(path)) {
    const base = env.apiUrl.replace(/\/$/, "");
    return `${base}${normalizeApiAssetPath(path)}`;
  }

  return path;
}
