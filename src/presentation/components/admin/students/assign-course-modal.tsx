"use client";

import { useEffect, useMemo, useState } from "react";
import type { CourseListItem, CourseModality } from "@/core/domain/courses/types";
import type { EnrollmentDeliveryMode, StudentEnrollment } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { listCourses, CoursesApiError } from "@/infrastructure/http/courses-api";
import {
  assignCourseToStudent,
  StudentsApiError,
} from "@/infrastructure/http/students-api";
import { showError, showSuccess, showWarning } from "@/shared/lib/alerts";
import { cn } from "@/shared/lib/cn";

type EnrollmentType = "particular" | "company";

function defaultDeliveryMode(modality: string | null | undefined): EnrollmentDeliveryMode {
  return modality === "presencial" ? "presencial" : "online";
}

interface AssignCourseModalProps {
  studentId: string;
  studentName: string;
  studentCompanyName?: string | null;
  studentCompanyRfc?: string | null;
  studentCurp?: string | null;
  studentStpsOccupationCode?: string | null;
  enrollments: StudentEnrollment[];
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignCourseModal({
  studentId,
  studentName,
  studentCompanyName,
  studentCompanyRfc,
  studentCurp,
  studentStpsOccupationCode,
  enrollments,
  onClose,
  onAssigned,
}: AssignCourseModalProps) {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>(
    studentCompanyName ? "company" : "particular",
  );
  const [deliveryMode, setDeliveryMode] = useState<EnrollmentDeliveryMode>("online");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCourseIds = useMemo(
    () => new Set(enrollments.filter((item) => item.status === "active").map((item) => item.courseId)),
    [enrollments],
  );

  const availableCourses = useMemo(
    () => courses.filter((course) => !activeCourseIds.has(course.id)),
    [courses, activeCourseIds],
  );

  useEffect(() => {
    async function loadCourses() {
      const token = authStorage.getToken();
      if (!token) {
        showError("Debes iniciar sesión");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const result = await listCourses(token, { status: "published", limit: 50 });
        const nextCourses = result.courses;
        setCourses(nextCourses);
        const firstAvailable = nextCourses.find((course) => !activeCourseIds.has(course.id));
        setSelectedCourseId(firstAvailable?.id ?? "");
        setDeliveryMode(defaultDeliveryMode(firstAvailable?.modality));
      } catch (err) {
        showError(
          err instanceof CoursesApiError ? err.message : "No se pudieron cargar los cursos",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCourses();
  }, [activeCourseIds]);

  async function handleAssign() {
    if (!selectedCourseId) return;

    const enrolledViaCompany = enrollmentType === "company";

    if (enrolledViaCompany) {
      if (!studentCompanyName?.trim()) {
        showWarning(
          "Registra la empresa del estudiante en su perfil antes de asignar un curso con DC3.",
          "Falta la empresa",
        );
        return;
      }
      if (!studentCompanyRfc?.trim()) {
        showWarning(
          "Registra el RFC de la empresa en el perfil del estudiante.",
          "Falta RFC",
        );
        return;
      }
      if (!studentCurp?.trim()) {
        showWarning("Registra la CURP del estudiante en su perfil.", "Falta CURP");
        return;
      }
      if (!studentStpsOccupationCode) {
        showWarning(
          "Registra el puesto del catálogo STPS en el perfil del estudiante.",
          "Falta puesto",
        );
        return;
      }
    }

    const token = authStorage.getToken();
    if (!token) {
      showError("Debes iniciar sesión");
      return;
    }

    setIsSubmitting(true);

    try {
      await assignCourseToStudent(
        token,
        studentId,
        selectedCourseId,
        enrolledViaCompany,
        deliveryMode,
      );
      showSuccess(
        enrolledViaCompany
          ? "Curso asignado. Al terminar podrá descargar constancia y DC3."
          : "Curso asignado. Al terminar podrá descargar la constancia.",
      );
      onAssigned();
      onClose();
    } catch (err) {
      showError(err instanceof StudentsApiError ? err.message : "No se pudo asignar el curso");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-brand-gray/40"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-brand-line bg-white p-6 shadow-xl">
        <h2 className="font-display text-lg font-bold text-brand-gray">Asignar curso</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Selecciona un curso <strong className="text-brand-gray">publicado</strong> para{" "}
          <strong className="text-brand-gray">{studentName}</strong>.
        </p>

        <div className="mt-6">
          <label htmlFor="assign-course" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Curso
          </label>
          {isLoading ? (
            <p className="text-sm text-brand-muted">Cargando cursos publicados...</p>
          ) : availableCourses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brand-line bg-brand-light/50 px-4 py-3 text-sm text-brand-muted">
              No hay cursos publicados disponibles para asignar. Publica un curso en el módulo de
              Cursos o el estudiante ya tiene todos asignados.
            </p>
          ) : (
            <select
              id="assign-course"
              value={selectedCourseId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedCourseId(nextId);
                const selected = availableCourses.find((course) => course.id === nextId);
                setDeliveryMode(defaultDeliveryMode(selected?.modality as CourseModality | null));
              }}
              className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-gray outline-none focus:border-brand-blue"
            >
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {availableCourses.length > 0 && (
          <fieldset className="mt-4 space-y-3">
            <legend className="text-sm font-medium text-brand-gray">
              Tipo de inscripción
            </legend>
            <p className="text-xs text-brand-muted">
              Define qué constancias podrá descargar el alumno al completar el curso.
            </p>

            <div className="space-y-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  enrollmentType === "particular"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-brand-line bg-brand-light/40 hover:bg-brand-light/70",
                )}
              >
                <input
                  type="radio"
                  name="enrollment-type"
                  value="particular"
                  checked={enrollmentType === "particular"}
                  onChange={() => setEnrollmentType("particular")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-brand-gray">Particular</span>
                  <span className="mt-1 block text-xs text-brand-muted">
                    Solo constancia de finalización al terminar el curso.
                  </span>
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  enrollmentType === "company"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-brand-line bg-brand-light/40 hover:bg-brand-light/70",
                )}
              >
                <input
                  type="radio"
                  name="enrollment-type"
                  value="company"
                  checked={enrollmentType === "company"}
                  onChange={() => setEnrollmentType("company")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-brand-gray">Con empresa</span>
                  <span className="mt-1 block text-xs text-brand-muted">
                    Constancia y DC3 al finalizar. Requiere que el estudiante tenga empresa
                    registrada.
                    {studentCompanyName ? (
                      <>
                        {" "}
                        Empresa:{" "}
                        <span className="font-medium text-brand-gray">{studentCompanyName}</span>
                      </>
                    ) : (
                      <span className="mt-1 block font-medium text-amber-700">
                        Este estudiante aún no tiene empresa en su perfil.
                      </span>
                    )}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        )}

        {availableCourses.length > 0 && (
          <fieldset className="mt-4 space-y-3">
            <legend className="text-sm font-medium text-brand-gray">Modalidad</legend>
            <p className="text-xs text-brand-muted">
              En línea se marca como terminado al completar el curso. Presencial lo marcas tú.
            </p>
            <div className="space-y-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  deliveryMode === "online"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-brand-line bg-brand-light/40 hover:bg-brand-light/70",
                )}
              >
                <input
                  type="radio"
                  name="delivery-mode"
                  value="online"
                  checked={deliveryMode === "online"}
                  onChange={() => setDeliveryMode("online")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-brand-gray">En línea</span>
                  <span className="mt-1 block text-xs text-brand-muted">
                    El alumno cursa en la plataforma. Al terminar, queda como terminado y puede
                    descargar la constancia.
                  </span>
                </span>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  deliveryMode === "presencial"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-brand-line bg-brand-light/40 hover:bg-brand-light/70",
                )}
              >
                <input
                  type="radio"
                  name="delivery-mode"
                  value="presencial"
                  checked={deliveryMode === "presencial"}
                  onChange={() => setDeliveryMode("presencial")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-brand-gray">Presencial</span>
                  <span className="mt-1 block text-xs text-brand-muted">
                    Tú marcas el curso como terminado para poder exportar la constancia.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleAssign()}
            disabled={isLoading || isSubmitting || !selectedCourseId}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
