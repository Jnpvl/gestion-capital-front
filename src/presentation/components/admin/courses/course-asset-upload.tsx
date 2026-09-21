"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CourseAssetKind } from "@/core/domain/courses/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { UploadApiError, deleteUploadedAsset, uploadCourseAsset } from "@/infrastructure/http/uploads-api";
import { showSuccess, showUploadError } from "@/shared/lib/alerts";
import { UPLOAD_LIMITS } from "@/shared/lib/upload-validation";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

interface CourseAssetUploadProps {
  courseId: string;
  kind: CourseAssetKind;
  value: string | null;
  onChange: (path: string) => void;
  label: string;
  hint?: string;
  accept: string;
  showThumbnail?: boolean;
  /** When "cover", server persists path to courses.cover_image and can delete the previous cover. */
  role?: "cover";
}

export function CourseAssetUpload({
  courseId,
  kind,
  value,
  onChange,
  label,
  hint,
  accept,
  showThumbnail = true,
  role,
}: CourseAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPathRef = useRef<string | null>(value);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    lastPathRef.current = value;
  }, [value]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = authStorage.getToken();
    if (!token) {
      showUploadError("Debes iniciar sesión para subir archivos");
      return;
    }

    setIsUploading(true);

    try {
      const previousPath = lastPathRef.current || value;
      const path = await uploadCourseAsset(token, courseId, file, kind, previousPath, {
        role,
      });
      lastPathRef.current = path;
      onChange(path);
      showSuccess("Archivo subido correctamente");
    } catch (err) {
      showUploadError(
        err instanceof UploadApiError ? err.message : "No se pudo subir el archivo",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const token = authStorage.getToken();
    if (!token) {
      showUploadError("Debes iniciar sesión para eliminar archivos");
      return;
    }

    const previous = (lastPathRef.current || value)?.trim();
    if (!previous) {
      onChange("");
      return;
    }

    try {
      await deleteUploadedAsset(token, previous, {
        role,
        courseId: role === "cover" ? courseId : undefined,
      });
      lastPathRef.current = null;
      onChange("");
      showSuccess("Archivo eliminado del servidor.");
    } catch (err) {
      showUploadError(
        err instanceof UploadApiError ? err.message : "No se pudo eliminar el archivo",
      );
    }
  }

  const fileName = value?.split("/").pop();
  const limitHint =
    kind === "image"
      ? `Imágenes ${UPLOAD_LIMITS.image.formatsLabel}. Máximo ${UPLOAD_LIMITS.image.maxLabel}.`
      : `Solo PDF. Máximo ${UPLOAD_LIMITS.pdf.maxLabel}.`;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-brand-gray">{label}</p>
        {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
        <p className="mt-1 text-xs text-brand-muted">{limitHint}</p>
      </div>

      {kind === "image" && showThumbnail && value && (
        <div className="relative aspect-[16/10] max-w-sm overflow-hidden rounded-xl border border-brand-line bg-brand-light">
          <Image src={resolveAssetUrl(value)} alt="Vista previa" fill className="object-cover" sizes="320px" />
        </div>
      )}

      {value && (
        <p className="text-xs text-brand-muted">
          Guardado en: <code className="rounded bg-brand-light px-1 py-0.5">{value}</code>
          {fileName ? ` (${fileName})` : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
        >
          {isUploading ? "Subiendo..." : value ? "Cambiar archivo" : "Subir archivo"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => void handleRemove()}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => void handleFileChange(e)}
        className="hidden"
      />
    </div>
  );
}
