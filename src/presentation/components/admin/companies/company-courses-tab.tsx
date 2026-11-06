"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseListItem } from "@/core/domain/courses/types";
import type {
  CompanyCourseAssignResult,
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
  getCompanyCourses,
} from "@/infrastructure/http/companies-api";
import { CoursesApiError, listCourses } from "@/infrastructure/http/courses-api";
import { showError, showSuccess, showWarning } from "@/shared/lib/alerts";
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

  useEffect(() => {
    void load();
  }, [load]);

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
      const changed = result.assigned + (result.upgraded ?? 0);
      if (changed > 0) {
        const parts = [
          result.assigned > 0
            ? `${result.assigned} nuevo${result.assigned === 1 ? "" : "s"}`
            : null,
          result.upgraded > 0
            ? `${result.upgraded} de particular a empresa`
            : null,
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-line p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-gray">Cursos de la empresa</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Solo inscripciones <strong className="font-medium text-brand-gray">con empresa</strong>.
              Los cursos particulares se ven en el expediente de cada persona.
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
                  <tr key={course.courseId}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-gray">{course.courseTitle}</p>
                      <p className="mt-1 text-xs text-brand-muted">Con empresa · DC3 al finalizar</p>
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
              <label htmlFor="company-assign-course" className="mb-1.5 block text-sm font-medium text-brand-gray">
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
              <p className="text-xs text-brand-muted">
                Tipo de inscripción: Con empresa (fijo). Elige cómo lo cursarán.
              </p>
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
                Curso seleccionado: <span className="font-medium text-brand-gray">{selectedCourse.title}</span>
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
