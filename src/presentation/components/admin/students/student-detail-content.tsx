"use client";

import { EmployeeBackLink } from "@/presentation/components/employee-back-link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import type { StudentDetail, StudentEnrollment } from "@/core/domain/students/types";
import { EDUCATION_LEVEL_LABELS, GENDER_LABELS, JOB_TYPE_LABELS, DELIVERY_MODE_LABELS } from "@/core/domain/students/types";
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
import { StudentFormsSection } from "./student-forms-section";
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
  const [view, setView] = useState("summary");
  const [editing, setEditing] = useState(false);
  const [showAssignCourse, setShowAssignCourse] = useState(false);

  const loadVersion = useRef(0);
  const loadStudent = useCallback(async () => {
    const version = ++loadVersion.current;
    const token = authStorage.getToken();
    if (!token || !params.id) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getStudent(token, params.id);
      if (version !== loadVersion.current) return;
      setStudent(result.student);
      setEnrollments(result.enrollments);
    } catch (err) {
      if (version !== loadVersion.current) return;
      const message =
        err instanceof StudentsApiError ? err.message : "Error al cargar el alumno";
      setLoadError(message);
      showError(message);
    } finally {
      if (version === loadVersion.current) setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    const counter = loadVersion;
    void Promise.resolve().then(() => { if (!cancelled) void loadStudent(); });
    return () => { cancelled = true; counter.current++; };
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

  const tabs = [
    { id: "summary", label: "Resumen" },
    { id: "profile", label: "Datos del alumno" },
    { id: "courses", label: "Cursos y constancias" },
    { id: "forms", label: "Formularios NOM-035" },
    { id: "access", label: "Acceso al aula" },
  ];
  const profileGroups = [
    { title: "Datos personales", fields: [
      ["Nombre(s)", student.firstNames], ["Apellido paterno", student.paternalLastName], ["Apellido materno", student.maternalLastName],
      ["Correo", student.email], ["Teléfono", student.phone], ["CURP", student.curp],
      ["Sexo", student.gender ? GENDER_LABELS[student.gender] : null], ["Edad", student.age == null ? null : `${student.age} años`], ["Lugar de residencia", student.residenceLocation],
    ] },
    { title: "Formación académica", fields: [
      ["Nivel de estudios", student.educationLevel ? EDUCATION_LEVEL_LABELS[student.educationLevel] : null],
      ["Profesión o área", student.professionArea], ["Institución", student.educationInstitution],
    ] },
    { title: "Información laboral", fields: [
      ["Trabaja actualmente", student.currentlyEmployed == null ? null : student.currentlyEmployed ? "Sí" : "No"],
      ["Empresa", student.companyName], ["RFC de la empresa", student.companyRfc], ["Puesto actual", student.currentPosition],
      ["Tipo de puesto", student.jobType ? JOB_TYPE_LABELS[student.jobType] : null], ["Sector", student.industrySector],
      ["Experiencia laboral", student.yearsExperience == null ? null : `${student.yearsExperience} años`], ["Tiempo en el puesto", student.timeInCurrentPosition],
    ] },
    { title: "Datos STPS", fields: [
      ["Código de ocupación", student.stpsOccupationCode], ["Ocupación", student.stpsOccupationName],
      ["Código de área temática", student.stpsThematicAreaCode], ["Área temática", student.stpsThematicAreaName],
    ] },
  ];
  const statCards = [
    { label: "Cursos asignados", value: enrollments.length, note: "Historial de inscripciones" },
    { label: "En curso", value: enrollments.filter(e => e.status === "active" && !e.completed).length, note: "Inscripciones vigentes sin terminar" },
    { label: "Terminados", value: enrollments.filter(e => e.completed).length, note: "Cursos con finalización registrada" },
    { label: "Constancias disponibles", value: enrollments.filter(e => e.status === "active" && e.canDownloadCertificate).length, note: "Listas para descargar" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <EmployeeBackLink />
      <header className="flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-brand-line bg-white p-6">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Expediente del alumno</p><h1 className="mt-2 font-display text-2xl font-bold text-brand-gray">{student.name}</h1><p className="mt-2 break-all text-sm text-brand-muted">{student.email}</p><p className="mt-1 text-sm text-brand-muted">{student.companyName ?? "Sin empresa vinculada"}</p><div className="mt-3 flex flex-wrap items-center gap-3"><AlumnoTypeBadge type={student.alumnoType} /><span className="text-xs text-brand-muted">Acceso al aula:</span><StudentStatusBadge active={student.active} /></div></div>
        <button type="button" onClick={() => { setView("profile"); setEditing(true); }} className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Editar perfil</button>
      </header>
      <div role="tablist" aria-label="Secciones del expediente" className="flex gap-1 overflow-x-auto rounded-2xl border border-brand-line bg-white p-1.5" onKeyDown={event => {
        const index = tabs.findIndex(tab => tab.id === view);
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
        if (next != null) { event.preventDefault(); setView(tabs[next].id); document.getElementById(`student-tab-${tabs[next].id}`)?.focus(); }
      }}>{tabs.map(tab => <button key={tab.id} id={`student-tab-${tab.id}`} type="button" role="tab" aria-selected={view === tab.id} aria-controls={`student-panel-${tab.id}`} tabIndex={view === tab.id ? 0 : -1} onClick={() => setView(tab.id)} className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold ${view === tab.id ? "bg-brand-blue text-white" : "text-brand-muted hover:bg-brand-light"}`}>{tab.label}</button>)}</div>

      <section id="student-panel-summary" role="tabpanel" aria-labelledby="student-tab-summary" hidden={view !== "summary"} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(card => <div key={card.label} className="rounded-2xl border border-brand-line bg-white p-5"><p className="text-xs font-semibold text-brand-muted">{card.label}</p><p className="mt-3 text-3xl font-bold tabular-nums text-brand-gray">{card.value}</p><p className="mt-2 text-xs text-brand-muted">{card.note}</p></div>)}</div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-white p-6"><h2 className="font-display text-lg font-bold">Información principal</h2><dl className="mt-4 divide-y divide-brand-line">{[["Teléfono", student.phone], ["Empresa", student.companyName], ["Puesto", student.currentPosition], ["Registro", new Date(student.createdAt).toLocaleDateString("es-MX")]].map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-2"><dt className="text-sm text-brand-muted">{label}</dt><dd className="break-words text-sm font-medium">{value || "Sin capturar"}</dd></div>)}</dl></div>
          <div className="rounded-2xl border border-brand-line bg-white p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold">Capacitación</h2><button type="button" onClick={() => setView("courses")} className="text-sm font-semibold text-brand-blue">Ver cursos →</button></div><p className="mt-3 text-sm text-brand-muted">Consulta el estado de las inscripciones y descarga los documentos disponibles en Cursos y constancias.</p><div className="mt-5 space-y-3">{enrollments.slice(0, 3).map(e => <div key={e.id} className="flex justify-between gap-4 rounded-xl bg-brand-light p-3 text-sm"><span className="font-medium">{e.courseTitle}</span><span className="shrink-0 text-brand-muted">{e.status !== "active" ? enrollmentStatusLabel[e.status] : e.completed ? "Terminado" : "En curso"}</span></div>)}{!enrollments.length && <p className="rounded-xl bg-brand-light p-4 text-sm text-brand-muted">Aún no tiene cursos asignados.</p>}</div></div>
        </div>
      </section>

      <section id="student-panel-profile" role="tabpanel" aria-labelledby="student-tab-profile" hidden={view !== "profile"} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Datos del alumno</h2><p className="mt-1 text-sm text-brand-muted">Información personal, académica, laboral y STPS.</p></div>{editing && <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium">Cancelar edición</button>}</div>
        {editing ? <StudentEditForm student={student} onUpdated={updated => { setStudent(updated); setEditing(false); }} /> : <>
          <div className="grid items-start gap-5 xl:grid-cols-2">{profileGroups.map(group => <div key={group.title} className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold">{group.title}</h3><dl className="mt-3 divide-y divide-brand-line">{group.fields.map(([label, value]) => <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-2 sm:gap-4"><dt className="text-brand-muted">{label}</dt><dd className={`break-words ${value ? "font-medium text-brand-gray" : "text-brand-muted"}`}>{value || "Sin capturar"}</dd></div>)}</dl></div>)}</div>
          <div className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold">Notas internas</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm text-brand-muted">{student.notes || "Sin notas registradas."}</p></div>
        </>}
      </section>

      <section id="student-panel-courses" role="tabpanel" aria-labelledby="student-tab-courses" hidden={view !== "courses"} className="overflow-hidden rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line p-6"><div><h2 className="font-display text-xl font-bold">Cursos y constancias</h2><p className="mt-1 text-sm text-brand-muted">Historial de inscripciones, estado de los cursos y documentos disponibles.</p></div><button type="button" onClick={() => setShowAssignCourse(true)} className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white">Asignar curso</button></div>
        {!enrollments.length ? <p className="p-10 text-center text-sm text-brand-muted">Este alumno aún no tiene cursos asignados.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-brand-light text-xs uppercase tracking-wide text-brand-muted"><tr>{["Curso", "Modalidad", "Estado del curso", "Documentos", "Acciones"].map(label => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-brand-line">{enrollments.map(enrollment => <tr key={enrollment.id} className="align-top">
          <td className="min-w-60 px-5 py-4"><p className="font-semibold">{enrollment.courseTitle}</p><p className="mt-1 text-xs text-brand-muted">Inscrito: {new Date(enrollment.enrolledAt).toLocaleDateString("es-MX")}</p><p className="mt-1 text-xs text-brand-muted">{enrollment.enrolledViaCompany ? "Con empresa" : "Particular"}</p></td>
          <td className="whitespace-nowrap px-5 py-4">{DELIVERY_MODE_LABELS[enrollment.deliveryMode]}</td>
          <td className="px-5 py-4"><span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", enrollment.status !== "active" ? enrollmentStatusStyles[enrollment.status] : enrollment.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{enrollment.status !== "active" ? enrollmentStatusLabel[enrollment.status] : enrollment.completed ? "Terminado" : "En curso"}</span></td>
          <td className="px-5 py-4"><div className="flex flex-col items-start gap-2">{enrollment.status === "active" && enrollment.canDownloadCertificate && <button type="button" onClick={() => void handleDownloadCertificate(enrollment, "certificate")} className="whitespace-nowrap text-xs font-semibold text-brand-blue hover:underline">Descargar constancia</button>}{enrollment.status === "active" && enrollment.canDownloadDc3 && <button type="button" onClick={() => void handleDownloadCertificate(enrollment, "dc3")} className="whitespace-nowrap text-xs font-semibold text-brand-blue hover:underline">Descargar DC3</button>}{(enrollment.status !== "active" || (!enrollment.canDownloadCertificate && !enrollment.canDownloadDc3)) && <span className="text-xs text-brand-muted">Sin documentos disponibles</span>}</div></td>
          <td className="px-5 py-4">{enrollment.status === "active" ? <div className="flex flex-col items-start gap-3">{enrollment.deliveryMode === "presencial" && !enrollment.completed && <button type="button" onClick={() => void handleMarkCompleted(enrollment)} className="whitespace-nowrap text-xs font-medium text-brand-blue hover:underline">Marcar terminado</button>}<button type="button" onClick={() => void handleRevokeEnrollment(enrollment)} className="whitespace-nowrap text-xs font-medium text-red-600 hover:underline">Quitar acceso al curso</button></div> : <span className="text-brand-muted">—</span>}</td>
        </tr>)}</tbody></table></div>}
      </section>

      <section id="student-panel-forms" role="tabpanel" aria-labelledby="student-tab-forms" hidden={view !== "forms"}>
        {view === "forms" && <StudentFormsSection key={`${student.id}:${student.companyId}`} companyId={student.companyId} studentId={student.id} employeeName={student.name} />}
      </section>
      <section id="student-panel-access" role="tabpanel" aria-labelledby="student-tab-access" hidden={view !== "access"} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-line bg-white p-6"><div><h2 className="font-display text-lg font-bold">Estado del acceso al aula</h2><p className="mt-1 text-sm text-brand-muted">Controla si el alumno puede ingresar a la plataforma. Es independiente del estado de sus cursos.</p><div className="mt-3"><StudentStatusBadge active={student.active} /></div></div><button type="button" onClick={() => void handleToggleStatus()} className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium hover:bg-brand-light">{student.active ? "Desactivar acceso" : "Activar acceso"}</button></div>
        <StudentAccessSection studentId={student.id} email={student.email} />
      </section>
      {showAssignCourse && <AssignCourseModal studentId={student.id} studentName={student.name} studentCompanyName={student.companyName} studentCompanyRfc={student.companyRfc} studentCurp={student.curp} studentStpsOccupationCode={student.stpsOccupationCode} enrollments={enrollments} onClose={() => setShowAssignCourse(false)} onAssigned={() => void loadStudent()} />}
    </div>
  );
}
