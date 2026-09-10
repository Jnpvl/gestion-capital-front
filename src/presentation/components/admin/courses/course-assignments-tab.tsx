"use client";

import { useCallback, useEffect, useState } from "react";
import type { AssignmentSubmissionListItem } from "@/core/domain/courses/assignment";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CoursesApiError,
  listCourseAssignments,
  reviewCourseAssignment,
} from "@/infrastructure/http/courses-api";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";
import { showError, showSaved } from "@/shared/lib/alerts";
import { cn } from "@/shared/lib/cn";

interface CourseAssignmentsTabProps {
  courseId: string;
}

type StatusFilter = "pending" | "returned" | "approved" | "all";

const STATUS_LABELS: Record<AssignmentSubmissionListItem["status"], string> = {
  pending: "En revisión",
  approved: "Aprobada",
  returned: "Devuelta",
};

export function CourseAssignmentsTab({ courseId }: CourseAssignmentsTabProps) {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [submissions, setSubmissions] = useState<AssignmentSubmissionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const load = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const { submissions: rows } = await listCourseAssignments(token, courseId, filter);
      setSubmissions(rows);
      setSelectedId((current) => {
        if (current && rows.some((row) => row.id === current)) return current;
        return rows[0]?.id ?? null;
      });
    } catch (error) {
      showError(
        error instanceof CoursesApiError ? error.message : "No se pudieron cargar las tareas",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = submissions.find((item) => item.id === selectedId) ?? null;

  async function handleReview(status: "approved" | "returned") {
    const token = authStorage.getToken();
    if (!token || !selected) return;

    if (status === "returned" && !reviewComment.trim()) {
      showError("Al devolver una tarea debes dejar una observación.");
      return;
    }

    setIsReviewing(true);
    try {
      await reviewCourseAssignment(token, courseId, selected.id, {
        status,
        reviewerComment: reviewComment.trim() || null,
      });
      showSaved(status === "approved" ? "Tarea aprobada." : "Tarea devuelta al alumno.");
      setReviewComment("");
      await load();
    } catch (error) {
      showError(
        error instanceof CoursesApiError ? error.message : "No se pudo revisar la entrega",
      );
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pendientes"],
            ["returned", "Devueltas"],
            ["approved", "Aprobadas"],
            ["all", "Todas"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === value
                ? "bg-brand-blue text-white"
                : "border border-brand-line bg-white text-brand-gray hover:bg-brand-light",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-muted">Cargando entregas...</p>
      ) : submissions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-8 text-center text-sm text-brand-muted">
          No hay entregas en este filtro.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="overflow-hidden rounded-xl border border-brand-line bg-white">
            <ul className="divide-y divide-brand-line">
              {submissions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setReviewComment("");
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-brand-light/60",
                      selectedId === item.id && "bg-brand-blue/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-gray">
                          {item.studentName}
                        </p>
                        <p className="truncate text-xs text-brand-muted">
                          {item.assignmentTitle || item.lessonTitle} · {item.sectionTitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-blue">
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">
                      Intento {item.attemptNumber} ·{" "}
                      {new Date(item.submittedAt).toLocaleString("es-MX")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selected && (
            <div className="space-y-4 rounded-xl border border-brand-line bg-white p-4 sm:p-5">
              <div>
                <h3 className="font-display text-lg font-bold text-brand-gray">
                  {selected.studentName}
                </h3>
                <p className="text-sm text-brand-muted">{selected.studentEmail}</p>
                <p className="mt-2 text-sm text-brand-gray">
                  {selected.assignmentTitle || selected.lessonTitle}
                </p>
              </div>

              <div className="rounded-lg border border-brand-line bg-brand-light/40 px-3 py-2 text-sm">
                <a
                  href={resolveAssetUrl(selected.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-blue hover:underline"
                >
                  Ver archivo: {selected.fileName || "entrega"}
                </a>
                {selected.studentComment && (
                  <p className="mt-2 text-brand-muted">
                    Comentario del alumno: {selected.studentComment}
                  </p>
                )}
              </div>

              {selected.reviewerComment && (
                <div className="rounded-lg border border-brand-line px-3 py-2 text-sm text-brand-muted">
                  Observación previa: {selected.reviewerComment}
                </div>
              )}

              {selected.status === "pending" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                      Observaciones
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      placeholder="Obligatorias al devolver. Opcionales al aprobar."
                      className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => void handleReview("approved")}
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => void handleReview("returned")}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Devolver
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  Esta entrega ya fue revisada ({STATUS_LABELS[selected.status]}).
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
