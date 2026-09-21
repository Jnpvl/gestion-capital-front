"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  UploadApiError,
  deleteUploadedAsset,
  uploadStaffLogo,
  uploadStaffPhoto,
  uploadStaffSignature,
} from "@/infrastructure/http/uploads-api";
import { showSuccess, showUploadError } from "@/shared/lib/alerts";
import { UPLOAD_LIMITS } from "@/shared/lib/upload-validation";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

type StaffMediaKind = "photo" | "logo" | "signature";

interface StaffMediaUploadProps {
  staffId: string;
  folderHint?: string;
  kind: StaffMediaKind;
  value: string | null;
  onChange: (path: string) => void;
}

const copy: Record<
  StaffMediaKind,
  {
    title: string;
    emptyLabel: string;
    upload: string;
    change: string;
    success: string;
    error: string;
    removeSuccess: string;
    alt: string;
    objectFit: "cover" | "contain";
  }
> = {
  photo: {
    title: "Fotografía del capacitador",
    emptyLabel: "Sin foto",
    upload: "Subir fotografía",
    change: "Cambiar fotografía",
    success: "Fotografía subida correctamente",
    error: "Error al subir la fotografía",
    removeSuccess: "Fotografía eliminada del servidor.",
    alt: "Fotografía del instructor",
    objectFit: "cover",
  },
  logo: {
    title: "Logo del instructor",
    emptyLabel: "Logo",
    upload: "Subir logo",
    change: "Cambiar logo",
    success: "Logo subido correctamente",
    error: "Error al subir el logo",
    removeSuccess: "Logo eliminado del servidor.",
    alt: "Logo del instructor",
    objectFit: "contain",
  },
  signature: {
    title: "Firma del instructor",
    emptyLabel: "Firma",
    upload: "Subir firma",
    change: "Cambiar firma",
    success: "Firma subida correctamente",
    error: "Error al subir la firma",
    removeSuccess: "Firma eliminada del servidor.",
    alt: "Firma del instructor",
    objectFit: "contain",
  },
};

export function StaffMediaUpload({
  staffId,
  folderHint,
  kind,
  value,
  onChange,
}: StaffMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const labels = copy[kind];

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
      const path =
        kind === "logo"
          ? await uploadStaffLogo(token, staffId, file, value)
          : kind === "signature"
            ? await uploadStaffSignature(token, staffId, file, value)
            : await uploadStaffPhoto(token, staffId, file, value);
      onChange(path);
      showSuccess(labels.success);
    } catch (err) {
      showUploadError(err instanceof UploadApiError ? err.message : labels.error);
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

    const previous = value?.trim();
    if (!previous) {
      onChange("");
      return;
    }

    try {
      await deleteUploadedAsset(token, previous, { role: kind, staffId });
      onChange("");
      showSuccess(labels.removeSuccess);
    } catch (err) {
      showUploadError(
        err instanceof UploadApiError ? err.message : "No se pudo eliminar el archivo",
      );
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-gray">{labels.title}</p>

      {value ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-brand-line bg-white">
          <Image
            src={resolveAssetUrl(value)}
            alt={labels.alt}
            fill
            className={labels.objectFit === "contain" ? "object-contain p-3" : "object-cover"}
            sizes="160px"
          />
        </div>
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-light text-sm font-medium text-brand-muted">
          {labels.emptyLabel}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
        >
          {isUploading ? "Subiendo..." : value ? labels.change : labels.upload}
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
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
      <p className="text-xs text-brand-muted">
        {kind === "signature"
          ? `Imagen de la firma autógrafa (${UPLOAD_LIMITS.image.formatsLabel}). Máximo ${UPLOAD_LIMITS.image.maxLabel}. Se usa en constancias y DC-3.`
          : `Se guardará en uploads/images/staff/${folderHint || "nombre-del-instructor"}/. Máximo ${UPLOAD_LIMITS.image.maxLabel}.`}
      </p>
    </div>
  );
}

interface StaffPendingSignatureFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export function StaffPendingSignatureField({
  file,
  onChange,
  required = false,
}: StaffPendingSignatureFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-gray">
        Firma del instructor{required ? " *" : ""}
      </p>

      {previewUrl ? (
        <div className="relative h-40 w-56 overflow-hidden rounded-xl border border-brand-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Vista previa de la firma" className="h-full w-full object-contain p-3" />
        </div>
      ) : (
        <div className="flex h-40 w-56 items-center justify-center rounded-xl border border-dashed border-brand-line bg-white text-sm font-medium text-brand-muted">
          Firma
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
        >
          {file ? "Cambiar firma" : "Subir firma"}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Quitar
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </div>
      <p className="text-xs text-brand-muted">
        Imagen de la firma autógrafa (PNG o JPG). Se usa en constancias y DC-3.
      </p>
    </div>
  );
}
