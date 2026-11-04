"use client";

import { EmployeeBackLink } from "@/presentation/components/employee-back-link";
import { useEffect, useState } from "react";
import { EDUCATION_LEVEL_LABELS, GENDER_LABELS, JOB_TYPE_LABELS, DELIVERY_MODE_LABELS } from "@/core/domain/students/types";
import { getPortalEmployeeDetail } from "@/infrastructure/http/company-portal-api";
import { StudentFormsSection } from "@/presentation/components/admin/students/student-forms-section";

const tabs = ["Resumen", "Datos del empleado", "Cursos y constancias", "Formularios NOM-035"] as const;
type Detail = Awaited<ReturnType<typeof getPortalEmployeeDetail>>;
const date = (value: string | null) => value ? new Date(value).toLocaleDateString("es-MX") : "—";

export function CompanyEmployeeDetail({ studentId }: { studentId: string }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumen");
  useEffect(() => {
    let cancelled = false;
    getPortalEmployeeDetail(studentId).then(result => {
      if (!cancelled) { setData(result); setError(null); }
    }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar el expediente."); });
    return () => { cancelled = true; };
  }, [studentId, revision]);

  const back = <EmployeeBackLink company />;
  if (error) return <div className="space-y-5">{back}<div role="alert" className="rounded-2xl border border-brand-line bg-white p-6"><p>{error}</p><button onClick={() => setRevision(r => r + 1)} className="mt-3 text-sm font-semibold text-brand-blue">Reintentar</button></div></div>;
  if (!data) return <div className="space-y-5">{back}<p role="status" className="text-sm text-brand-muted">Cargando expediente del empleado...</p></div>;
  const { student: s, enrollments } = data;
  const active = enrollments.filter(e => e.status === "active");
  const completed = enrollments.filter(e => e.completed);
  const metrics = [["Cursos registrados", enrollments.length], ["En curso", active.filter(e => !e.completed).length], ["Completados", completed.length], ["Constancias disponibles", enrollments.filter(e => e.canDownloadCertificate).length]] as const;

  return <div className="space-y-6">
    {back}
    <header className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Expediente del empleado</p><h1 className="mt-2 font-display text-2xl font-bold text-brand-gray">{s.name}</h1><p className="mt-2 text-sm text-brand-muted">{s.currentPosition || "Puesto no registrado"} · {s.companyName}</p><p className="mt-1 break-all text-sm text-brand-muted">{s.email}</p></div></div></header>
    <div role="tablist" aria-label="Secciones del expediente" className="flex gap-1 overflow-x-auto rounded-xl border border-brand-line bg-white p-1.5">{tabs.map(item => <button key={item} id={`tab-${tabs.indexOf(item)}`} role="tab" aria-selected={tab === item} aria-controls="employee-panel" onClick={() => setTab(item)} className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === item ? "bg-brand-blue text-white" : "text-brand-muted hover:bg-brand-light"}`}>{item}</button>)}</div>
    <section id="employee-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`} className="space-y-5">
      {tab === "Resumen" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-brand-line bg-white p-5"><p className="text-sm text-brand-muted">{label}</p><p className="mt-3 text-3xl font-bold text-brand-blue">{value}</p></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><Fields title="Información del empleado" rows={[["Nombre", s.name], ["CURP", s.curp], ["Correo", s.email], ["Teléfono", s.phone], ["Puesto", s.currentPosition]]}/><div className="rounded-2xl border border-brand-line bg-white p-6"><h2 className="font-display text-lg font-bold">Evaluaciones NOM-035</h2><p className="mt-3 text-sm leading-relaxed text-brand-muted">Consulta el estado, las respuestas y los resultados de las guías I, II, III y V en un solo lugar.</p><button onClick={() => setTab("Formularios NOM-035")} className="mt-5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light">Ver formularios y resultados →</button></div></div></>}
      {tab === "Datos del empleado" && <div className="grid items-start gap-5 xl:grid-cols-2"><Fields title="Datos personales" rows={[["Nombre", s.name], ["CURP", s.curp], ["Correo", s.email], ["Teléfono", s.phone], ["Sexo", s.gender ? GENDER_LABELS[s.gender] : null], ["Edad", s.age == null ? null : `${s.age} años`], ["Residencia", s.residenceLocation]]}/><Fields title="Formación académica" rows={[["Escolaridad", s.educationLevel ? EDUCATION_LEVEL_LABELS[s.educationLevel] : null], ["Profesión / área", s.professionArea], ["Institución", s.educationInstitution]]}/><Fields title="Información laboral" rows={[["Empresa", s.companyName], ["RFC", s.companyRfc], ["Puesto", s.currentPosition], ["Tipo de puesto", s.jobType ? JOB_TYPE_LABELS[s.jobType] : null], ["Sector", s.industrySector], ["Experiencia", s.yearsExperience == null ? null : `${s.yearsExperience} años`], ["Antigüedad en el puesto", s.timeInCurrentPosition]]}/><Fields title="Datos STPS" rows={[["Ocupación", s.stpsOccupationName], ["Clave de ocupación", s.stpsOccupationCode], ["Área temática", s.stpsThematicAreaName], ["Clave del área", s.stpsThematicAreaCode]]}/></div>}
      {tab === "Cursos y constancias" && <div className="overflow-hidden rounded-2xl border border-brand-line bg-white"><div className="border-b border-brand-line p-6"><h2 className="font-display text-lg font-bold">Cursos y constancias</h2><p className="mt-1 text-sm text-brand-muted">Historial de capacitación y disponibilidad de documentos del empleado.</p></div>{enrollments.length === 0 ? <p className="p-6 text-sm text-brand-muted">Este empleado aún no tiene cursos registrados.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-brand-light text-brand-muted"><tr>{["Curso", "Modalidad", "Inscripción", "Estado", "Documentos"].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{enrollments.map(e => <tr key={e.id} className="border-t border-brand-line"><td className="min-w-56 px-5 py-4 font-medium">{e.courseTitle}</td><td className="px-5 py-4">{DELIVERY_MODE_LABELS[e.deliveryMode]}</td><td className="whitespace-nowrap px-5 py-4">{date(e.enrolledAt)}</td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${e.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{e.status === "revoked" ? "Revocado" : e.status === "expired" ? "Vencido" : e.completed ? "Completado" : "En curso"}</span>{e.completedAt && <p className="mt-2 text-xs text-brand-muted">{date(e.completedAt)}</p>}</td><td className="min-w-44 px-5 py-4 text-xs text-brand-muted">{[e.canDownloadCertificate && "Constancia disponible", e.canDownloadDc3 && "DC-3 disponible"].filter(Boolean).join(" · ") || "Sin documentos disponibles"}</td></tr>)}</tbody></table></div>}</div>}
      {tab === "Formularios NOM-035" && <StudentFormsSection companyId={s.companyId} studentId={s.id} employeeName={s.name} readOnly/>}
    </section>
  </div>;
}

function Fields({ title, rows }: { title: string; rows: [string, string | null][] }) {
  return <section className="rounded-2xl border border-brand-line bg-white p-6"><h2 className="font-display text-lg font-bold">{title}</h2><dl className="mt-4 divide-y divide-brand-line">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4"><dt className="text-sm text-brand-muted">{label}</dt><dd className="break-words text-sm font-medium text-brand-gray">{value || "No registrado"}</dd></div>)}</dl></section>;
}
