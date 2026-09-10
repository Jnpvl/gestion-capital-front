"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { StudentDetail, StudentEnrollment } from "@/core/domain/students/types";
import { DELIVERY_MODE_LABELS } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  getStudent,
  markStudentEnrollmentCompleted,
  revokeStudentEnrollment,
  StudentsApiError,
  updateStudentStatus,
} from "@/infrastructure/http/students-api";
import {
  CoursesApiError,
  downloadEnrollmentCertificate,
  downloadEnrollmentDc3,
} from "@/infrastructure/http/courses-api";
import {
  confirmAction,
  showError,
  showSuccess,
} from "@/shared/lib/alerts";
import { cn } from "@/shared/lib/cn";
import { AlumnoTypeBadge } from "@/presentation/components/admin/students/alumno-type-badge";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";
import { StudentAccessSection } from "@/presentation/components/admin/students/student-access-section";
import { StudentEditForm } from "@/presentation/components/admin/students/student-edit-form";
import { AssignCourseModal } from "@/presentation/components/admin/students/assign-course-modal";

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
  const [showAssignCourse, setShowAssignCourse] = useState(false);

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
      const message =
        err instanceof StudentsApiError ? err.message : "Error al cargar el alumno";
      setLoadError(message);
      showError(message);
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

    const nextActive = !student.active;
    const confirmed = await confirmAction({
      title: nextActive ? "Activar acceso" : "Desactivar acceso",
      text: nextActive
        ? `¿Activar el acceso de ${student.name}?`
        : `¿Desactivar el acceso de ${student.name}? El alumno no podrá ingresar a sus cursos.`,
      confirmText: nextActive ? "Sí, activar" : "Sí, desactivar",
      icon: "question",
    });
    if (!confirmed) return;

    try {
      await updateStudentStatus(token, student.id, nextActive);
      await loadStudent();
      showSuccess(nextActive ? "Acceso activado" : "Acceso desactivado");
    } catch (err) {
      showError(
        err instanceof StudentsApiError ? err.message : "No se pudo actualizar el estado",
      );
    }
  }

  async function handleRevokeEnrollment(enrollment: StudentEnrollment) {
    if (!student) return;

    const confirmed = await confirmAction({
      title: "Quitar acceso al curso",
      text: `¿Seguro que deseas quitar el acceso de "${enrollment.courseTitle}" a ${student.name}? El alumno dejará de ver este curso hasta que lo vuelvas a asignar.`,
      confirmText: "Sí, quitar acceso",
    });
    if (!confirmed) return;

    const token = authStorage.getToken();
    if (!token) return;

    try {
      await revokeStudentEnrollment(token, student.id, enrollment.id);
      await loadStudent();
      showSuccess("Acceso al curso retirado");
    } catch (err) {
      showError(err instanceof StudentsApiError ? err.message : "No se pudo quitar el curso");
    }
  }

  async function handleMarkCompleted(enrollment: StudentEnrollment) {
    if (!student) return;
    const token = authStorage.getToken();
    if (!token) return;

    const confirmed = await confirmAction({
      title: "Marcar como terminado",
      text: `¿Marcar "${enrollment.courseTitle}" como terminado para ${student.name}? Podrás descargar su constancia.`,
      confirmText: "Sí, marcar terminado",
      icon: "question",
    });
    if (!confirmed) return;

    try {
      await markStudentEnrollmentCompleted(token, student.id, enrollment.id);
      await loadStudent();
      showSuccess("Curso marcado como terminado");
    } catch (err) {
      showError(
        err instanceof StudentsApiError ? err.message : "No se pudo marcar como terminado",
      );
    }
  }

  async function handleDownloadCertificate(enrollment: StudentEnrollment, kind: "certificate" | "dc3") {
    try {
      if (kind === "dc3") {
        await downloadEnrollmentDc3(enrollment.courseId, enrollment.id, enrollment.courseSlug);
      } else {
        await downloadEnrollmentCertificate(enrollment.courseId, enrollment.id, enrollment.courseSlug);
      }
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo descargar el documento",
      );
    }
  }

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando alumno...</p>;
  }

  if (!student) {
    return (
      <div className="rounded-xl border border-brand-line bg-brand-light p-6 text-sm text-brand-muted">
        {loadError || "Alumno no encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/alumnos" className="text-sm font-medium text-brand-blue hover:underline">
          ← Volver a alumnos
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-brand-gray">{student.name}</h1>
              <AlumnoTypeBadge type={student.alumnoType} />
              <StudentStatusBadge active={student.active} />
            </div>
            <p className="mt-1 text-sm text-brand-muted">{student.email}</p>
            {student.companyName && (
              <p className="mt-1 text-sm text-brand-muted">
                Empresa: {student.companyName}
                {student.companyRfc ? ` · RFC ${student.companyRfc}` : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleToggleStatus()}
            className="shrink-0 rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-white"
          >
            {student.active ? "Desactivar acceso" : "Activar acceso"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-gray">Perfil del alumno</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Mismos campos que al crear: datos personales, formación, información laboral y STPS.
        </p>
        <div className="mt-6">
          <StudentEditForm
            student={student}
            onUpdated={(updated) => {
              setStudent(updated);
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentAccessSection studentId={student.id} email={student.email} />

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

          {enrollments.length === 0 ? (
            <p className="mt-6 rounded-lg bg-brand-light px-4 py-6 text-center text-sm text-brand-muted">
              Este alumno aún no tiene cursos asignados.
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
                        <span
                          className={cn(
                            "ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            enrollment.enrolledViaCompany
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-brand-muted",
                          )}
                        >
                          {enrollment.enrolledViaCompany ? "Con empresa" : "Particular"}
                        </span>
                        <span className="ml-2 inline-flex rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-gray">
                          {DELIVERY_MODE_LABELS[enrollment.deliveryMode]}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          enrollment.status !== "active"
                            ? enrollmentStatusStyles[enrollment.status]
                            : enrollment.completed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {enrollment.status !== "active"
                          ? enrollmentStatusLabel[enrollment.status]
                          : enrollment.completed
                            ? "Terminado"
                            : "En curso"}
                      </span>
                      {enrollment.status === "active" && (
                        <div className="flex flex-col items-end gap-1">
                          {enrollment.deliveryMode === "presencial" && !enrollment.completed && (
                            <button
                              type="button"
                              onClick={() => void handleMarkCompleted(enrollment)}
                              className="text-xs font-medium text-brand-blue hover:underline"
                            >
                              Marcar terminado
                            </button>
                          )}
                          {enrollment.canDownloadCertificate && (
                            <button
                              type="button"
                              onClick={() => void handleDownloadCertificate(enrollment, "certificate")}
                              className="text-xs font-medium text-brand-blue hover:underline"
                            >
                              Descargar constancia
                            </button>
                          )}
                          {enrollment.canDownloadDc3 && (
                            <button
                              type="button"
                              onClick={() => void handleDownloadCertificate(enrollment, "dc3")}
                              className="text-xs font-medium text-brand-blue hover:underline"
                            >
                              Descargar DC3
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleRevokeEnrollment(enrollment)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Quitar acceso
                          </button>
                        </div>
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
          studentCompanyName={student.companyName}
          studentCompanyRfc={student.companyRfc}
          studentCurp={student.curp}
          studentStpsOccupationCode={student.stpsOccupationCode}
          enrollments={enrollments}
          onClose={() => setShowAssignCourse(false)}
          onAssigned={() => void loadStudent()}
        />
      )}
    </div>
  );
}
