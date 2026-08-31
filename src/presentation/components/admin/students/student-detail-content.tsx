"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { StudentDetail, StudentEnrollment } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  getStudent,
  revokeStudentEnrollment,
  StudentsApiError,
  updateStudentStatus,
} from "@/infrastructure/http/students-api";
import { cn } from "@/shared/lib/cn";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";
import { StudentAccessSection } from "@/presentation/components/admin/students/student-access-section";
import { AssignCourseModal } from "@/presentation/components/admin/students/assign-course-modal";
import { ConfirmDialog } from "@/presentation/components/ui/confirm-dialog";

const enrollmentStatusLabel = {
  active: "Activa",
  revoked: "Retirada",
  expired: "Vencida",
} as const;

const enrollmentStatusStyles = {
  active: "bg-emerald-50 text-emerald-700",
  revoked: "bg-gray-100 text-brand-muted",
  expired: "bg-amber-50 text-amber-700",
} as const;

export function StudentDetailContent() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showAssignCourse, setShowAssignCourse] = useState(false);
  const [enrollmentToRevoke, setEnrollmentToRevoke] = useState<StudentEnrollment | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadStudent = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token || !params.id) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getStudent(token, params.id);
      setStudent(result.student);
      setEnrollments(result.enrollments);
    } catch (err) {
      setLoadError(err instanceof StudentsApiError ? err.message : "Error al cargar el estudiante");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  async function handleToggleStatus() {
    if (!student) return;
    const token = authStorage.getToken();
    if (!token) return;

    try {
      await updateStudentStatus(token, student.id, !student.active);
      await loadStudent();
    } catch (err) {
      setActionError(err instanceof StudentsApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  async function handleConfirmRevoke() {
    if (!student || !enrollmentToRevoke) return;

    const token = authStorage.getToken();
    if (!token) return;

    setIsRevoking(true);
    setActionError("");

    try {
      await revokeStudentEnrollment(token, student.id, enrollmentToRevoke.id);
      setEnrollmentToRevoke(null);
      await loadStudent();
    } catch (err) {
      setActionError(err instanceof StudentsApiError ? err.message : "No se pudo quitar el curso");
    } finally {
      setIsRevoking(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando estudiante...</p>;
  }

  if (!student) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {loadError || "Estudiante no encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/estudiantes" className="text-sm font-medium text-brand-blue hover:underline">
          ← Volver a estudiantes
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-gray">{student.name}</h1>
            <p className="mt-1 text-sm text-brand-muted">{student.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StudentStatusBadge active={student.active} />
            <button
              type="button"
              onClick={() => void handleToggleStatus()}
              className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-white"
            >
              {student.active ? "Desactivar acceso" : "Activar acceso"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-line bg-white p-6">
            <h2 className="font-display text-lg font-bold text-brand-gray">Información</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-brand-muted">Teléfono</dt>
                <dd className="font-medium text-brand-gray">{student.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Registrado</dt>
                <dd className="font-medium text-brand-gray">
                  {new Date(student.createdAt).toLocaleDateString("es-MX")}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Notas internas</dt>
                <dd className="whitespace-pre-wrap text-brand-gray">
                  {student.notes ?? "Sin notas"}
                </dd>
              </div>
            </dl>
          </div>

          <StudentAccessSection studentId={student.id} email={student.email} />
        </div>

        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-gray">Cursos inscritos</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Asigna o retira cursos según el pago y acuerdos con el alumno.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAssignCourse(true)}
              className="shrink-0 rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray"
            >
              Asignar curso
            </button>
          </div>

          {actionError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </p>
          )}

          {enrollments.length === 0 ? (
            <p className="mt-6 rounded-lg bg-brand-light px-4 py-6 text-center text-sm text-brand-muted">
              Este estudiante aún no tiene cursos asignados.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {enrollments.map((enrollment) => (
                <li
                  key={enrollment.id}
                  className="rounded-lg border border-brand-line px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-gray">{enrollment.courseTitle}</p>
                      <p className="text-xs text-brand-muted">
                        Inscrito: {new Date(enrollment.enrolledAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          enrollmentStatusStyles[enrollment.status],
                        )}
                      >
                        {enrollmentStatusLabel[enrollment.status]}
                      </span>
                      {enrollment.status === "active" && (
                        <button
                          type="button"
                          onClick={() => setEnrollmentToRevoke(enrollment)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Quitar acceso
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showAssignCourse && (
        <AssignCourseModal
          studentId={student.id}
          studentName={student.name}
          enrollments={enrollments}
          onClose={() => setShowAssignCourse(false)}
          onAssigned={() => void loadStudent()}
        />
      )}

      <ConfirmDialog
        open={enrollmentToRevoke !== null}
        title="Quitar acceso al curso"
        description={
          enrollmentToRevoke
            ? `¿Seguro que deseas quitar el acceso de "${enrollmentToRevoke.courseTitle}" a ${student.name}? El alumno dejará de ver este curso hasta que lo vuelvas a asignar.`
            : ""
        }
        confirmLabel="Sí, quitar acceso"
        cancelLabel="Cancelar"
        isLoading={isRevoking}
        onConfirm={() => void handleConfirmRevoke()}
        onCancel={() => {
          if (!isRevoking) setEnrollmentToRevoke(null);
        }}
      />
    </div>
  );
}
