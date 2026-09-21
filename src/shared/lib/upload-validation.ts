export const UPLOAD_LIMITS = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    maxLabel: "5 MB",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
    formatsLabel: "JPG, PNG, WEBP o GIF",
  },
  pdf: {
    maxBytes: 20 * 1024 * 1024,
    maxLabel: "20 MB",
    mimeTypes: ["application/pdf"] as const,
    formatsLabel: "PDF",
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a user-facing error message, or null if the file is valid. */
export function validateUploadFile(file: File, kind: UploadKind): string | null {
  const limits = UPLOAD_LIMITS[kind];

  const mimeOk =
    (limits.mimeTypes as readonly string[]).includes(file.type) ||
    (kind === "image" && file.type.startsWith("image/")) ||
    (kind === "pdf" &&
      (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")));

  if (!mimeOk) {
    return `Formato no permitido. Usa ${limits.formatsLabel}.`;
  }

  if (file.size > limits.maxBytes) {
    return `El archivo pesa ${formatBytes(file.size)} y el máximo es ${limits.maxLabel}. Prueba con uno más ligero.`;
  }

  return null;
}

export function resolveUploadErrorMessage(
  status: number,
  payload: { error?: { message?: string; code?: string } } | null,
  fallback: string,
): string {
  const serverMessage = payload?.error?.message?.trim();
  if (serverMessage) return serverMessage;

  if (status === 413) {
    return "El archivo es demasiado pesado para subirlo. Reduce su tamaño e inténtalo de nuevo.";
  }
  if (status === 401 || status === 403) {
    return "Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.";
  }
  if (status >= 500) {
    return "El servidor no pudo procesar el archivo. Inténtalo de nuevo en unos momentos.";
  }

  return fallback;
}
