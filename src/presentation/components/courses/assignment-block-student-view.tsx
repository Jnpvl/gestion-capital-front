"use client";

import { useRef, useState } from "react";
import type { LessonBlock } from "@/core/domain/courses/types";
import type { AssignmentProgressItem } from "@/core/domain/courses/assignment";
import { parseAssignmentContent } from "@/core/domain/courses/assignment";
import type { CourseProgress } from "@/core/domain/student/progress.types";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import {
  StudentProgressApiError,
  submitAssignment,
} from "@/infrastructure/http/student-progress-api";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";
import { showError, showSuccess } from "@/shared/lib/alerts";

interface AssignmentBlockStudentViewProps {
  block: LessonBlock;
  courseSlug: string;
  assignment?: AssignmentProgressItem;
  readOnly?: boolean;
  onProgressChange?: (progress: CourseProgress) => void;
}

const STATUS_LABELS: Record<AssignmentProgressItem["status"], string> = {
  none: "Sin enviar",
  pending: "En revisión",
  approved: "Aprobada",
  returned: "Devuelta",
};

export function AssignmentBlockStudentView({
  block,
  courseSlug,
  assignment,
  readOnly = false,
  onProgressChange,
}: AssignmentBlockStudentViewProps) {
  const content = parseAssignmentContent(block.content);
  const status = assignment?.status ?? "none";
  const canSubmit = !readOnly && (status === "none" || status === "returned");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const token = studentAuthStorage.getToken();
    if (!token) {
      showError("Inicia sesión como alumno para enviar la tarea.");
      return;
    }
    if (!file) {
      showError("Selecciona un archivo PDF o imagen para enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { progress } = await submitAssignment(
        token,
        courseSlug,
        block.id,
        file,
        comment,
      );
      onProgressChange?.(progress);
      setFile(null);
      setComment("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      showSuccess("Tarea enviada. Queda en revisión.");
    } catch (error) {
      showError(
        error instanceof StudentProgressApiError
          ? error.message
          : "No se pudo enviar la tarea",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {content.instructions.trim() && (
        <div className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">
          {content.instructions}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={
            status === "approved"
              ? "rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700"
              : status === "pending"
                ? "rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700"
                : status === "returned"
                  ? "rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700"
                  : "rounded-full bg-brand-light px-2.5 py-1 font-semibold text-brand-muted"
          }
        >
          {STATUS_LABELS[status]}
        </span>
        {content.required ? (
          <span className="text-brand-muted">Obligatoria</span>
        ) : (
          <span className="text-brand-muted">Opcional</span>
        )}
        {assignment && assignment.attemptNumber > 0 && (
          <span className="text-brand-muted">Intento {assignment.attemptNumber}</span>
        )}
      </div>

      {block.resourceUrl?.trim() && (
        <a
          href={resolveAssetUrl(block.resourceUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-brand-blue hover:underline"
        >
          Descargar archivo de apoyo
        </a>
      )}

      {assignment?.fileUrl && (
        <div className="rounded-lg border border-brand-line bg-brand-light/40 px-3 py-2 text-sm">
          <p className="font-medium text-brand-gray">
            Entrega: {assignment.fileName || "archivo"}
          </p>
          <a
            href={resolveAssetUrl(assignment.fileUrl)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-brand-blue hover:underline"
          >
            Ver archivo enviado
          </a>
          {assignment.studentComment && (
            <p className="mt-2 text-brand-muted">Tu comentario: {assignment.studentComment}</p>
          )}
        </div>
      )}

      {assignment?.reviewerComment && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            status === "returned"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <p className="font-medium">Observación del instructor</p>
          <p className="mt-1 whitespace-pre-line">{assignment.reviewerComment}</p>
        </div>
      )}

      {canSubmit && (
        <div className="space-y-3 rounded-lg border border-dashed border-brand-line p-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Archivo (PDF o imagen)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-brand-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <button
            type="button"
            disabled={isSubmitting || !file}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Enviando..."
              : status === "returned"
                ? "Reenviar tarea"
                : "Enviar tarea"}
          </button>
        </div>
      )}

      {readOnly && status === "none" && (
        <p className="text-sm text-brand-muted">
          El alumno podrá subir su entrega aquí en el aula.
        </p>
      )}
    </div>
  );
}
