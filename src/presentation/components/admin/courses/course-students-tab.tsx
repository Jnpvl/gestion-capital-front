"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CourseEnrollmentListItem,
  EnrollmentDeliveryMode,
} from "@/core/domain/students/types";
import { DELIVERY_MODE_LABELS } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CoursesApiError,
  downloadEnrollmentCertificate,
  downloadEnrollmentDc3,
  exportCourseCertificatesZip,
  listCourseEnrollments,
  markCourseEnrollmentCompleted,
} from "@/infrastructure/http/courses-api";
import { confirmAction, showError, showSuccess } from "@/shared/lib/alerts";
import { cn } from "@/shared/lib/cn";

interface CourseStudentsTabProps {
  courseId: string;
}

type DeliveryFilter = "all" | EnrollmentDeliveryMode;

function toUtcDay(iso: string): number {
  const date = new Date(iso);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function parseInputDay(value: string): number | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

function enrollmentOverlapsPeriod(
  enrollment: CourseEnrollmentListItem,
  fromDay: number | null,
  toDay: number | null,
): boolean {
  if (fromDay === null && toDay === null) return true;

  const start = toUtcDay(enrollment.enrolledAt);
  const end = enrollment.completedAt ? toUtcDay(enrollment.completedAt) : start;

  if (fromDay !== null && end < fromDay) return false;
  if (toDay !== null && start > toDay) return false;
  return true;
}

export function CourseStudentsTab({ courseId }: CourseStudentsTabProps) {
  const [enrollments, setEnrollments] = useState<CourseEnrollmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [exportingKind, setExportingKind] = useState<"constancia" | "dc3" | null>(null);

  const loadEnrollments = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await listCourseEnrollments(token, courseId);
      setEnrollments(result.enrollments);
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudieron cargar los alumnos",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadEnrollments();
  }, [loadEnrollments]);

  const filteredEnrollments = useMemo(() => {
    const fromDay = parseInputDay(periodFrom);
    const toDay = parseInputDay(periodTo);
    return enrollments.filter((item) => {
      if (deliveryFilter !== "all" && item.deliveryMode !== deliveryFilter) return false;
      return enrollmentOverlapsPeriod(item, fromDay, toDay);
    });
  }, [enrollments, deliveryFilter, periodFrom, periodTo]);

  const exportableCount = useMemo(
    () => filteredEnrollments.filter((item) => item.canDownloadCertificate).length,
    [filteredEnrollments],
  );

  const exportableDc3Count = useMemo(
    () => filteredEnrollments.filter((item) => item.canDownloadDc3).length,
    [filteredEnrollments],
  );

  async function handleMarkCompleted(enrollment: CourseEnrollmentListItem) {
    const token = authStorage.getToken();
    if (!token) return;

    const confirmed = await confirmAction({
      title: "Marcar como terminado",
      text: `¿Marcar el curso como terminado para ${enrollment.studentName}? Podrás descargar su constancia.`,
      confirmText: "Sí, marcar terminado",
      icon: "question",
    });
    if (!confirmed) return;

    setBusyId(enrollment.id);
    try {
      const result = await markCourseEnrollmentCompleted(token, courseId, enrollment.id);
      setEnrollments((current) =>
        current.map((item) => (item.id === enrollment.id ? result.enrollment : item)),
      );
      showSuccess("Alumno marcado como terminado");
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo marcar como terminado",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(enrollment: CourseEnrollmentListItem, kind: "certificate" | "dc3") {
    setBusyId(enrollment.id);
    try {
      if (kind === "dc3") {
        await downloadEnrollmentDc3(courseId, enrollment.id, enrollment.courseSlug);
      } else {
        await downloadEnrollmentCertificate(courseId, enrollment.id, enrollment.courseSlug);
      }
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo descargar el documento",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleBulkExport(kind: "constancia" | "dc3") {
    const count = kind === "dc3" ? exportableDc3Count : exportableCount;
    const labelDoc = kind === "dc3" ? "DC3" : "constancia";
    const labelDocs = kind === "dc3" ? "DC3" : "constancias";

    if (count === 0) {
      showError(
        kind === "dc3"
          ? "No hay DC3 listos en el filtro actual"
          : "No hay constancias listas en el filtro actual",
      );
      return;
    }

    const label =
      deliveryFilter === "all"
        ? "todas las modalidades"
        : DELIVERY_MODE_LABELS[deliveryFilter].toLowerCase();

    const confirmed = await confirmAction({
      title: kind === "dc3" ? "Exportar DC3" : "Exportar constancias",
      text: `Se descargará un ZIP con ${count} ${count === 1 ? labelDoc : labelDocs} (${label}).`,
      confirmText: "Descargar ZIP",
      icon: "question",
    });
    if (!confirmed) return;

    setExportingKind(kind);
    try {
      await exportCourseCertificatesZip(courseId, {
        deliveryMode: deliveryFilter,
        kind,
        enrollmentIds: filteredEnrollments
          .filter((item) =>
            kind === "dc3" ? item.canDownloadDc3 : item.canDownloadCertificate,
          )
          .map((item) => item.id),
      });
      showSuccess(kind === "dc3" ? "ZIP de DC3 descargado" : "ZIP de constancias descargado");
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo exportar el ZIP",
      );
    } finally {
      setExportingKind(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando alumnos inscritos...</p>;
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/50 px-4 py-10 text-center text-sm text-brand-muted">
        Aún no hay alumnos inscritos en este curso. Asígnaselos desde su ficha o emítelos desde
        Emisión presencial.
      </div>
    );
  }

  const hasPeriodFilter = Boolean(periodFrom || periodTo);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-gray">Alumnos inscritos</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Filtra por modalidad o rango de fechas y exporta constancias o DC3 del filtro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "online", label: "En línea" },
              { value: "presencial", label: "Presencial" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDeliveryFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                deliveryFilter === option.value
                  ? "bg-brand-blue text-white"
                  : "bg-brand-light text-brand-gray hover:bg-brand-line/60",
              )}
            >
              {option.label}
            </button>
          ))}

          <label className="flex items-center gap-1.5 text-sm text-brand-muted">
            <span>Desde</span>
            <input
              type="date"
              value={periodFrom}
              max={periodTo || undefined}
              onChange={(event) => setPeriodFrom(event.target.value)}
              className="rounded-lg border border-brand-line bg-white px-2 py-1.5 text-sm text-brand-gray outline-none focus:border-brand-blue"
            />
          </label>
          <label className="flex items-center gap-1.5 text-sm text-brand-muted">
            <span>Hasta</span>
            <input
              type="date"
              value={periodTo}
              min={periodFrom || undefined}
              onChange={(event) => setPeriodTo(event.target.value)}
              className="rounded-lg border border-brand-line bg-white px-2 py-1.5 text-sm text-brand-gray outline-none focus:border-brand-blue"
            />
          </label>
          {hasPeriodFilter && (
            <button
              type="button"
              onClick={() => {
                setPeriodFrom("");
                setPeriodTo("");
              }}
              className="text-xs font-medium text-brand-blue hover:underline"
            >
              Limpiar fechas
            </button>
          )}

          <button
            type="button"
            disabled={exportingKind !== null || exportableCount === 0}
            onClick={() => void handleBulkExport("constancia")}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {exportingKind === "constancia"
              ? "Generando ZIP..."
              : `Exportar constancias (${exportableCount})`}
          </button>

          <button
            type="button"
            disabled={exportingKind !== null || exportableDc3Count === 0}
            onClick={() => void handleBulkExport("dc3")}
            className="rounded-lg border border-brand-blue bg-white px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-light disabled:opacity-50"
          >
            {exportingKind === "dc3"
              ? "Generando ZIP..."
              : `Exportar DC3 (${exportableDc3Count})`}
          </button>
        </div>
      </div>

      <p className="text-xs text-brand-muted">
        Mostrando {filteredEnrollments.length} de {enrollments.length} alumnos
        {deliveryFilter !== "all" ? ` · ${DELIVERY_MODE_LABELS[deliveryFilter]}` : ""}
        {hasPeriodFilter
          ? ` · periodo ${periodFrom || "…"} → ${periodTo || "…"}`
          : ""}
        .
      </p>

      {filteredEnrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/50 px-4 py-8 text-center text-sm text-brand-muted">
          No hay alumnos con ese filtro.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-line text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-3 py-2 font-semibold">Alumno</th>
                <th className="px-3 py-2 font-semibold">Modalidad</th>
                <th className="px-3 py-2 font-semibold">Periodo</th>
                <th className="px-3 py-2 font-semibold">Folio</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Progreso</th>
                <th className="px-3 py-2 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-brand-line last:border-0">
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/alumnos/${enrollment.studentId}`}
                      className="font-medium text-brand-gray hover:text-brand-blue"
                    >
                      {enrollment.studentName}
                    </Link>
                    <p className="text-xs text-brand-muted">{enrollment.studentEmail}</p>
                    <p className="mt-1 text-[11px] text-brand-muted">
                      {enrollment.enrolledViaCompany ? "Con empresa" : "Particular"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-brand-gray">
                    {DELIVERY_MODE_LABELS[enrollment.deliveryMode]}
                  </td>
                  <td className="px-3 py-3 text-brand-gray">{enrollment.periodLabel}</td>
                  <td className="px-3 py-3 font-mono text-xs text-brand-gray">
                    {enrollment.certificateNumber ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        enrollment.completed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {enrollment.completed ? "Terminado" : "En curso"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-brand-gray">{enrollment.progressPercent}%</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-end gap-1">
                      {enrollment.deliveryMode === "presencial" && !enrollment.completed && (
                        <button
                          type="button"
                          disabled={busyId === enrollment.id}
                          onClick={() => void handleMarkCompleted(enrollment)}
                          className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50"
                        >
                          Marcar terminado
                        </button>
                      )}
                      {enrollment.canDownloadCertificate && (
                        <button
                          type="button"
                          disabled={busyId === enrollment.id}
                          onClick={() => void handleDownload(enrollment, "certificate")}
                          className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50"
                        >
                          Exportar constancia
                        </button>
                      )}
                      {enrollment.canDownloadDc3 && (
                        <button
                          type="button"
                          disabled={busyId === enrollment.id}
                          onClick={() => void handleDownload(enrollment, "dc3")}
                          className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50"
                        >
                          Exportar DC3
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
