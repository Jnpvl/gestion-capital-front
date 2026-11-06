"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseListItem } from "@/core/domain/courses/types";
import type {
  CompanyCourseAssignResult,
  CompanyCourseDetail,
  CompanyCourseSummary,
} from "@/core/domain/companies/types";
import {
  DELIVERY_MODE_LABELS,
  type EnrollmentDeliveryMode,
} from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  assignCompanyCourse,
  CompaniesApiError,
  getCompanyCourseDetail,
  getCompanyCourses,
} from "@/infrastructure/http/companies-api";
import {
  CoursesApiError,
  downloadEnrollmentCertificate,
  downloadEnrollmentDc3,
  exportCourseCertificatesZip,
  listCourses,
  markCourseEnrollmentCompleted,
} from "@/infrastructure/http/courses-api";
import { confirmAction, showError, showSuccess, showWarning } from "@/shared/lib/alerts";
import { cn } from "@/shared/lib/cn";

function defaultDeliveryMode(modality: string | null | undefined): EnrollmentDeliveryMode {
  return modality === "presencial" ? "presencial" : "online";
}

function deliveryLabel(modes: EnrollmentDeliveryMode[]) {
  if (modes.length === 0) return "—";
  if (modes.length === 1) return DELIVERY_MODE_LABELS[modes[0]];
  return modes.map((mode) => DELIVERY_MODE_LABELS[mode]).join(" · ");
}

export function CompanyCoursesTab({
  companyId,
  companyRfc,
  employeesCount,
}: {
  companyId: string;
  companyRfc: string | null;
  employeesCount: number;
}) {
  const [courses, setCourses] = useState<CompanyCourseSummary[]>([]);
  const [published, setPublished] = useState<CourseListItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<EnrollmentDeliveryMode>("online");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [lastResult, setLastResult] = useState<CompanyCourseAssignResult | null>(null);
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CompanyCourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exportingKind, setExportingKind] = useState<"constancia" | "dc3" | null>(null);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getCompanyCourses(token, companyId);
      setCourses(result.courses);
    } catch (err) {
      showError(err instanceof CompaniesApiError ? err.message : "Error al cargar cursos");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const loadDetail = useCallback(
    async (courseId: string) => {
      const token = authStorage.getToken();
      if (!token) return;
      setDetailLoading(true);
      try {
        setDetail(await getCompanyCourseDetail(token, companyId, courseId));
        setSelectedEnrollmentIds([]);
      } catch (err) {
        showError(err instanceof CompaniesApiError ? err.message : "Error al cargar el curso");
        setDetail(null);
        setDetailCourseId(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!detailCourseId) {
      setDetail(null);
      setSelectedEnrollmentIds([]);
      return;
    }
    void loadDetail(detailCourseId);
  }, [detailCourseId, loadDetail]);

  useEffect(() => {
    if (!showAssign) return;
    const token = authStorage.getToken();
    if (!token) return;
    void listCourses(token, { status: "published", limit: 50 })
      .then((result) => {
        setPublished(result.courses);
        const first = result.courses[0];
        setSelectedCourseId(first?.id ?? "");
        setDeliveryMode(defaultDeliveryMode(first?.modality));
      })
      .catch((err) => {
        showError(err instanceof CoursesApiError ? err.message : "No se pudieron cargar los cursos");
        setPublished([]);
      });
  }, [showAssign]);

  const selectedCourse = useMemo(
    () => published.find((course) => course.id === selectedCourseId) ?? null,
    [published, selectedCourseId],
  );

  const exportableConstancias = useMemo(
    () => detail?.enrollments.filter((item) => item.canDownloadCertificate) ?? [],
    [detail],
  );
  const exportableDc3 = useMemo(
    () => detail?.enrollments.filter((item) => item.canDownloadDc3) ?? [],
    [detail],
  );
  const completableEnrollments = useMemo(
    () =>
      detail?.enrollments.filter(
        (item) => item.deliveryMode === "presencial" && !item.completed,
      ) ?? [],
    [detail],
  );
  const allCompletableSelected =
    completableEnrollments.length > 0 &&
    completableEnrollments.every((item) => selectedEnrollmentIds.includes(item.id));
  const selectedCompletableCount = useMemo(
    () =>
      completableEnrollments.filter((item) => selectedEnrollmentIds.includes(item.id)).length,
    [completableEnrollments, selectedEnrollmentIds],
  );

  function toggleEnrollmentSelection(enrollmentId: string, checked: boolean) {
    setSelectedEnrollmentIds((current) =>
      checked ? [...new Set([...current, enrollmentId])] : current.filter((id) => id !== enrollmentId),
    );
  }

  function toggleAllCompletable(checked: boolean) {
    const ids = new Set(completableEnrollments.map((item) => item.id));
    setSelectedEnrollmentIds((current) =>
      checked
        ? [...new Set([...current, ...ids])]
        : current.filter((id) => !ids.has(id)),
    );
  }

  async function handleAssign() {
    if (!selectedCourseId) return;
    if (!companyRfc?.trim()) {
      showWarning(
        "Registra el RFC de la empresa en Datos generales antes de asignar cursos con DC3.",
        "Falta RFC",
      );
      return;
    }
    if (employeesCount < 1) {
      showWarning("Vincula empleados a la empresa antes de asignar un curso.", "Sin empleados");
      return;
    }

    const token = authStorage.getToken();
    if (!token) {
      showError("Debes iniciar sesión");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await assignCompanyCourse(token, companyId, {
        courseId: selectedCourseId,
        deliveryMode,
      });
      setCourses(result.courses);
      setLastResult(result);
      setShowAssign(false);
      if (detailCourseId === selectedCourseId) void loadDetail(selectedCourseId);
      const changed = result.assigned + (result.upgraded ?? 0);
      if (changed > 0) {
        const parts = [
          result.assigned > 0
            ? `${result.assigned} nuevo${result.assigned === 1 ? "" : "s"}`
            : null,
          result.upgraded > 0 ? `${result.upgraded} de particular a empresa` : null,
        ].filter(Boolean);
        showSuccess(
          `Listo (${parts.join(" · ")}). Modalidad: ${DELIVERY_MODE_LABELS[deliveryMode]}.`,
        );
      } else {
        showWarning(
          "No hubo cambios. Revisa el detalle: ya lo tenían con empresa o les faltan datos (CURP / puesto STPS).",
          "Sin asignaciones nuevas",
        );
      }
    } catch (err) {
      showError(err instanceof CompaniesApiError ? err.message : "No se pudo asignar el curso");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkSelectedCompleted() {
    if (!detail || selectedCompletableCount === 0) return;
    const token = authStorage.getToken();
    if (!token) {
      showError("Debes iniciar sesión");
      return;
    }

    const selected = completableEnrollments.filter((item) =>
      selectedEnrollmentIds.includes(item.id),
    );
    const confirmed = await confirmAction({
      title: "Marcar como terminado",
      text:
        selected.length === 1
          ? `¿Marcar el curso como terminado para ${selected[0].studentName}? Podrás descargar su constancia y DC3.`
          : `¿Marcar el curso como terminado para ${selected.length} empleados presenciales? Podrás descargar sus constancias y DC3.`,
      confirmText: "Sí, marcar terminado",
      icon: "question",
    });
    if (!confirmed) return;

    setIsMarkingCompleted(true);
    let ok = 0;
    let failed = 0;
    try {
      for (const enrollment of selected) {
        try {
          await markCourseEnrollmentCompleted(token, detail.course.id, enrollment.id);
          ok += 1;
        } catch {
          failed += 1;
        }
      }
      await loadDetail(detail.course.id);
      void load();
      if (ok > 0 && failed === 0) {
        showSuccess(
          ok === 1
            ? "Empleado marcado como terminado"
            : `${ok} empleados marcados como terminados`,
        );
      } else if (ok > 0) {
        showWarning(
          `${ok} marcados · ${failed} no se pudieron actualizar`,
          "Resultado parcial",
        );
      } else {
        showError("No se pudo marcar como terminado");
      }
    } finally {
      setIsMarkingCompleted(false);
    }
  }

  async function handleIndividualDownload(
    enrollment: CompanyCourseDetail["enrollments"][number],
    kind: "constancia" | "dc3",
  ) {
    if (!detail) return;
    const key = `${enrollment.id}:${kind}`;
    setDownloadingKey(key);
    try {
      if (kind === "dc3") {
        await downloadEnrollmentDc3(detail.course.id, enrollment.id, detail.course.slug);
      } else {
        await downloadEnrollmentCertificate(detail.course.id, enrollment.id, detail.course.slug);
      }
    } catch (err) {
      showError(
        err instanceof CoursesApiError
          ? err.message
          : kind === "dc3"
            ? "No se pudo descargar el DC3"
            : "No se pudo descargar la constancia",
      );
    } finally {
      setDownloadingKey(null);
    }
  }

  async function handleBulkExport(kind: "constancia" | "dc3") {
    if (!detail) return;
    const ready = kind === "dc3" ? exportableDc3 : exportableConstancias;
    const labelDoc = kind === "dc3" ? "DC3" : "constancia";
    const labelDocs = kind === "dc3" ? "DC3" : "constancias";
    if (ready.length === 0) {
      showError(
        kind === "dc3"
          ? "Aún no hay DC3 listos (faltan empleados terminados con empresa)."
          : "Aún no hay constancias listas (faltan empleados terminados).",
      );
      return;
    }
    const confirmed = await confirmAction({
      title: kind === "dc3" ? "Exportar DC3" : "Exportar constancias",
      text: `Se descargará un ZIP con ${ready.length} ${ready.length === 1 ? labelDoc : labelDocs} de los empleados de esta empresa en el curso.`,
      confirmText: "Descargar ZIP",
      icon: "question",
    });
    if (!confirmed) return;

    setExportingKind(kind);
    try {
      await exportCourseCertificatesZip(detail.course.id, {
        kind,
        enrollmentIds: ready.map((item) => item.id),
      });
      showSuccess(kind === "dc3" ? "ZIP de DC3 descargado" : "ZIP de constancias descargado");
    } catch (err) {
      showError(err instanceof CoursesApiError ? err.message : "No se pudo exportar el ZIP");
    } finally {
      setExportingKind(null);
    }
  }

  if (detailCourseId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setDetailCourseId(null);
            void load();
          }}
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← Volver a cursos de la empresa
        </button>

        {detailLoading || !detail ? (
          <p className="text-sm text-brand-muted">Cargando detalle del curso...</p>
        ) : (
          <>
            <div className="rounded-2xl border border-brand-line bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                    Curso con empresa
                  </p>
                  <h2 className="mt-2 font-display text-xl font-bold text-brand-gray">
                    {detail.course.title}
                  </h2>
                  <p className="mt-2 text-sm text-brand-muted">
                    {detail.course.activeCount} / {detail.course.employeesTotal} asignados ·{" "}
                    {detail.course.completedCount} completados ·{" "}
                    {deliveryLabel(detail.course.deliveryModes)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={exportingKind !== null || exportableConstancias.length === 0}
                    onClick={() => void handleBulkExport("constancia")}
                    className="rounded-xl border border-brand-line px-4 py-2.5 text-sm font-semibold text-brand-gray hover:bg-brand-light disabled:opacity-50"
                  >
                    {exportingKind === "constancia"
                      ? "Exportando…"
                      : `Exportar constancias (${exportableConstancias.length})`}
                  </button>
                  <button
                    type="button"
                    disabled={exportingKind !== null || exportableDc3.length === 0}
                    onClick={() => void handleBulkExport("dc3")}
                    className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-50"
                  >
                    {exportingKind === "dc3"
                      ? "Exportando…"
                      : `Exportar DC3 (${exportableDc3.length})`}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-line bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-line p-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-gray">
                    Empleados asignados ({detail.enrollments.length})
                  </h3>
                  {completableEnrollments.length > 0 && (
                    <p className="mt-1 text-sm text-brand-muted">
                      Selecciona empleados presenciales en curso para marcarlos como terminados.
                      {selectedCompletableCount > 0
                        ? ` ${selectedCompletableCount} seleccionado${selectedCompletableCount === 1 ? "" : "s"}.`
                        : ""}
                    </p>
                  )}
                </div>
                {completableEnrollments.length > 0 && (
                  <button
                    type="button"
                    disabled={isMarkingCompleted || selectedCompletableCount === 0}
                    onClick={() => void handleMarkSelectedCompleted()}
                    className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-50"
                  >
                    {isMarkingCompleted
                      ? "Marcando…"
                      : selectedCompletableCount > 0
                        ? `Marcar terminado (${selectedCompletableCount})`
                        : "Marcar terminado"}
                  </button>
                )}
              </div>
              {detail.enrollments.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-brand-muted">
                  Nadie de esta empresa tiene el curso con empresa.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                        <th className="w-10 px-4 py-3.5">
                          <input
                            type="checkbox"
                            aria-label="Seleccionar empleados presenciales pendientes"
                            checked={allCompletableSelected}
                            disabled={completableEnrollments.length === 0}
                            onChange={(event) => toggleAllCompletable(event.target.checked)}
                            className="size-4 rounded border-brand-line text-brand-blue focus:ring-brand-blue disabled:opacity-40"
                          />
                        </th>
                        <th className="px-4 py-3.5 font-semibold">Empleado</th>
                        <th className="px-4 py-3.5 font-semibold">Modalidad</th>
                        <th className="px-4 py-3.5 font-semibold">Progreso</th>
                        <th className="px-4 py-3.5 font-semibold">Estado</th>
                        <th className="px-6 py-3.5 font-semibold">Documentos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-line">
                      {detail.enrollments.map((enrollment) => {
                        const canComplete =
                          enrollment.deliveryMode === "presencial" && !enrollment.completed;
                        return (
                          <tr key={enrollment.id}>
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                aria-label={`Seleccionar a ${enrollment.studentName}`}
                                checked={selectedEnrollmentIds.includes(enrollment.id)}
                                disabled={!canComplete}
                                onChange={(event) =>
                                  toggleEnrollmentSelection(enrollment.id, event.target.checked)
                                }
                                className="size-4 rounded border-brand-line text-brand-blue focus:ring-brand-blue disabled:opacity-40"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-brand-gray">{enrollment.studentName}</p>
                              <p className="mt-0.5 text-xs text-brand-muted">
                                {enrollment.studentEmail}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                              {DELIVERY_MODE_LABELS[enrollment.deliveryMode]}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-brand-gray">
                              {enrollment.progressPercent}%
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex flex-col items-start gap-1.5">
                                {enrollment.completed ? (
                                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                    Completado
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-muted">
                                    En curso
                                  </span>
                                )}
                                {canComplete ? (
                                  <span className="text-[11px] font-medium text-brand-blue">
                                    Selecciona para marcar terminado
                                  </span>
                                ) : enrollment.deliveryMode === "online" && !enrollment.completed ? (
                                  <span className="text-[11px] text-brand-muted">
                                    Se completa en la plataforma
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {enrollment.canDownloadCertificate || enrollment.canDownloadDc3 ? (
                                <div className="flex flex-col items-start gap-1">
                                  {enrollment.canDownloadCertificate && (
                                    <button
                                      type="button"
                                      disabled={downloadingKey !== null}
                                      onClick={() =>
                                        void handleIndividualDownload(enrollment, "constancia")
                                      }
                                      className="text-xs font-semibold text-brand-blue hover:underline disabled:opacity-50"
                                    >
                                      {downloadingKey === `${enrollment.id}:constancia`
                                        ? "Descargando…"
                                        : "Constancia"}
                                    </button>
                                  )}
                                  {enrollment.canDownloadDc3 && (
                                    <button
                                      type="button"
                                      disabled={downloadingKey !== null}
                                      onClick={() =>
                                        void handleIndividualDownload(enrollment, "dc3")
                                      }
                                      className="text-xs font-semibold text-brand-blue hover:underline disabled:opacity-50"
                                    >
                                      {downloadingKey === `${enrollment.id}:dc3`
                                        ? "Descargando…"
                                        : "DC3"}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-brand-muted">Pendiente</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-brand-line bg-white">
              <div className="border-b border-brand-line p-6">
                <h3 className="font-display text-lg font-bold text-brand-gray">
                  Faltan por asignar ({detail.missing.length})
                </h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Empleados activos de la empresa que aún no tienen este curso con empresa.
                </p>
              </div>
              {detail.missing.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-brand-muted">
                  Todos los empleados activos ya tienen este curso con empresa.
                </p>
              ) : (
                <ul className="divide-y divide-brand-line">
                  {detail.missing.map((employee) => (
                    <li
                      key={employee.studentId}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-brand-gray">{employee.name}</p>
                        <p className="text-xs text-brand-muted">{employee.email}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {employee.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-line p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-gray">Cursos de la empresa</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Solo inscripciones <strong className="font-medium text-brand-gray">con empresa</strong>.
              Haz clic en un curso para ver asignados, quién falta y exportar constancias / DC3.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLastResult(null);
              setShowAssign(true);
            }}
            className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light"
          >
            Asignar curso a empleados
          </button>
        </div>

        {isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-brand-muted">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-brand-muted">
            Aún no hay cursos asignados con empresa. Usa «Asignar curso a empleados» para dar acceso a
            todos los trabajadores vinculados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                  <th className="px-6 py-3.5 font-semibold">Curso</th>
                  <th className="px-4 py-3.5 font-semibold">Modalidad</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Asignados</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Completados</th>
                  <th className="px-6 py-3.5 font-semibold">Última asignación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="cursor-pointer transition-colors hover:bg-brand-light/50"
                    onClick={() => setDetailCourseId(course.courseId)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-blue">{course.courseTitle}</p>
                      <p className="mt-1 text-xs text-brand-muted">
                        Con empresa · clic para ver detalle
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                      {deliveryLabel(course.deliveryModes)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-brand-gray">
                      {course.activeCount}
                      <span className="text-brand-muted"> / {course.employeesTotal}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-brand-gray">
                      {course.completedCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-brand-muted">
                      {course.lastEnrolledAt
                        ? new Date(course.lastEnrolledAt).toLocaleDateString("es-MX")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lastResult && (
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <h3 className="font-display text-base font-bold text-brand-gray">
            Resultado: {lastResult.courseTitle}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {lastResult.assigned} nuevos · {lastResult.upgraded ?? 0} particular→empresa ·{" "}
            {lastResult.skipped} omitidos · {lastResult.failed} con error · modalidad{" "}
            {DELIVERY_MODE_LABELS[lastResult.deliveryMode]}
          </p>
          {(lastResult.upgraded > 0 || lastResult.skipped > 0 || lastResult.failed > 0) && (
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
              {lastResult.results
                .filter((row) => row.status !== "assigned")
                .map((row) => (
                  <li
                    key={row.studentId}
                    className="rounded-lg bg-brand-light px-3 py-2 text-brand-gray"
                  >
                    <strong>{row.name}</strong>
                    <span className="text-brand-muted"> · {row.reason ?? row.status}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div aria-hidden className="absolute inset-0 bg-brand-gray/40" />
          <div className="relative w-full max-w-lg rounded-2xl border border-brand-line bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold text-brand-gray">
              Asignar curso a empleados
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Se asignará a los <strong className="text-brand-gray">{employeesCount}</strong> empleados
              activos, siempre <strong className="text-brand-gray">con empresa</strong> (constancia y
              DC3). Si alguien ya lo tiene como particular, se cambia a empresa conservando su
              progreso. Solo se omite si ya está con empresa o le faltan CURP / puesto STPS.
            </p>

            <div className="mt-6">
              <label
                htmlFor="company-assign-course"
                className="mb-1.5 block text-sm font-medium text-brand-gray"
              >
                Curso publicado
              </label>
              {published.length === 0 ? (
                <p className="rounded-lg border border-dashed border-brand-line bg-brand-light/50 px-4 py-3 text-sm text-brand-muted">
                  No hay cursos publicados disponibles.
                </p>
              ) : (
                <select
                  id="company-assign-course"
                  value={selectedCourseId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCourseId(id);
                    const course = published.find((item) => item.id === id);
                    setDeliveryMode(defaultDeliveryMode(course?.modality));
                  }}
                  className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
                >
                  {published.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <fieldset className="mt-5 space-y-3">
              <legend className="text-sm font-medium text-brand-gray">Modalidad</legend>
              <div className="space-y-2">
                {(["online", "presencial"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      deliveryMode === mode
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-brand-line bg-brand-light/40 hover:bg-brand-light/70",
                    )}
                  >
                    <input
                      type="radio"
                      name="company-delivery-mode"
                      value={mode}
                      checked={deliveryMode === mode}
                      onChange={() => setDeliveryMode(mode)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block text-sm font-medium text-brand-gray">
                        {DELIVERY_MODE_LABELS[mode]}
                      </span>
                      <span className="mt-1 block text-xs text-brand-muted">
                        {mode === "online"
                          ? "El alumno cursa en la plataforma; al terminar puede descargar constancia y DC3."
                          : "Tú marcas el curso como terminado para emitir constancia y DC3."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {selectedCourse && (
              <p className="mt-4 text-xs text-brand-muted">
                Curso seleccionado:{" "}
                <span className="font-medium text-brand-gray">{selectedCourse.title}</span>
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssign(false)}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleAssign()}
                disabled={isSubmitting || !selectedCourseId || published.length === 0}
                className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
              >
                {isSubmitting ? "Asignando..." : "Asignar a todos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
