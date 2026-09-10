"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseDetail } from "@/core/domain/courses/types";
import {
  fetchCourseCertificatePreview,
  fetchCourseDc3Preview,
  previewCourseCertificate,
  previewCourseDc3,
} from "@/infrastructure/http/courses-api";
import { showError, showSuccess } from "@/shared/lib/alerts";

interface CertificatePreviewProps {
  courseId: string;
  courseTitle: string;
  templateUrl: string | null;
  variant?: "certificate" | "dc3";
  compact?: boolean;
  course?: CourseDetail | null;
}

export function CertificatePreview({
  courseId,
  courseTitle,
  templateUrl,
  variant = "certificate",
  compact = false,
  course = null,
}: CertificatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const objectUrlRef = useRef<string | null>(null);
  const isDc3 = variant === "dc3";

  const courseSignature = [
    course?.title,
    course?.duration,
    course?.period,
    course?.location,
    course?.modality,
    course?.instructor?.name,
    course?.instructor?.career,
    course?.instructor?.professionalArea,
    course?.instructor?.aceStpsRegistration,
    course?.instructor?.renapConocer,
    course?.instructor?.professionalLicense,
    course?.instructor?.photoUrl,
    course?.instructor?.logoUrl,
    course?.instructor?.signatureUrl,
    course?.stpsThematicAreaCode,
    course?.stpsThematicAreaName,
  ].join("|");

  useEffect(() => {
    if (!templateUrl && !isDc3) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPdfUrl(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const blob = isDc3
          ? await fetchCourseDc3Preview(courseId)
          : await fetchCourseCertificatePreview(courseId, templateUrl!);
        if (cancelled) return;

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setPdfUrl(objectUrl);
      } catch (error) {
        if (cancelled) return;
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setPdfUrl(null);
        setLoadError(
          error instanceof Error ? error.message : "No se pudo generar la vista previa",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [courseId, templateUrl, isDc3, courseSignature, reloadToken]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  async function handleDownloadPdfPreview() {
    if (!isDc3 && !templateUrl) return;

    setIsDownloading(true);
    try {
      if (isDc3) {
        await previewCourseDc3(courseId, courseTitle);
      } else {
        await previewCourseCertificate(courseId, templateUrl!, courseTitle);
      }
      showSuccess("Vista previa descargada");
    } catch (previewError) {
      showError(
        previewError instanceof Error
          ? previewError.message
          : "No se pudo generar la vista previa",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (!templateUrl && !isDc3) {
    return (
      <p className="text-sm text-brand-muted">
        Sube una plantilla para ver cómo quedará la constancia con los datos del alumno.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={
          compact
            ? "mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border border-brand-line bg-brand-light/40 shadow-sm"
            : "overflow-hidden rounded-xl border border-brand-line bg-brand-light/40 shadow-sm"
        }
      >
        {isLoading ? (
          <div className="flex h-[720px] items-center justify-center text-sm text-brand-muted">
            Generando vista previa PDF...
          </div>
        ) : loadError ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-red-600">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
            >
              Reintentar
            </button>
          </div>
        ) : pdfUrl ? (
          <iframe
            title={isDc3 ? "Vista previa DC3" : "Vista previa de constancia"}
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="block h-[720px] w-full bg-white"
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isDownloading || isLoading || !pdfUrl}
          onClick={() => void handleDownloadPdfPreview()}
          className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
        >
          {isDownloading ? "Descargando..." : "Descargar PDF"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setReloadToken((value) => value + 1)}
          className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
        >
          Actualizar
        </button>
        <p className="text-xs text-brand-muted">
          {isDc3
            ? "La vista previa muestra el PDF final con los datos de ejemplo."
            : "La vista previa usa datos genéricos del alumno/curso e incluye instructor, QR y folio."}
        </p>
      </div>
    </div>
  );
}
