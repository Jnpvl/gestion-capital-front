"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CourseAssetKind } from "@/core/domain/courses/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { UploadApiError, uploadCourseAsset } from "@/infrastructure/http/uploads-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
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
}: CourseAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = authStorage.getToken();
    if (!token) {
      showError("Debes iniciar sesión para subir archivos");
      return;
    }

    setIsUploading(true);

    try {
      const path = await uploadCourseAsset(token, courseId, file, kind);
      onChange(path);
      showSuccess("Archivo subido correctamente");
    } catch (err) {
      showError(err instanceof UploadApiError ? err.message : "Error al subir el archivo");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileName = value?.split("/").pop();

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-brand-gray">{label}</p>
        {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
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
            onClick={() => {
              onChange("");
              showSuccess("Archivo quitado. Recuerda guardar los cambios del curso.");
            }}
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
