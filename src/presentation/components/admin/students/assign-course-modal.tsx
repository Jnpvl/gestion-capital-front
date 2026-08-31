"use client";

import { useEffect, useMemo, useState } from "react";
import type { CourseListItem } from "@/core/domain/courses/types";
import type { StudentEnrollment } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { listCourses, CoursesApiError } from "@/infrastructure/http/courses-api";
import {
  assignCourseToStudent,
  StudentsApiError,
} from "@/infrastructure/http/students-api";

interface AssignCourseModalProps {
  studentId: string;
  studentName: string;
  enrollments: StudentEnrollment[];
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignCourseModal({
  studentId,
  studentName,
  enrollments,
  onClose,
  onAssigned,
}: AssignCourseModalProps) {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        setError("Debes iniciar sesión");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await listCourses(token, { status: "published", limit: 50 });
        setCourses(result.courses);
        setSelectedCourseId(result.courses.find((course) => !activeCourseIds.has(course.id))?.id ?? "");
      } catch (err) {
        setError(err instanceof CoursesApiError ? err.message : "No se pudieron cargar los cursos");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCourses();
  }, [activeCourseIds]);

  async function handleAssign() {
    if (!selectedCourseId) return;

    const token = authStorage.getToken();
    if (!token) {
      setError("Debes iniciar sesión");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await assignCourseToStudent(token, studentId, selectedCourseId);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err instanceof StudentsApiError ? err.message : "No se pudo asignar el curso");
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
      <div className="relative w-full max-w-md rounded-2xl border border-brand-line bg-white p-6 shadow-xl">
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
              onChange={(e) => setSelectedCourseId(e.target.value)}
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

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
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
