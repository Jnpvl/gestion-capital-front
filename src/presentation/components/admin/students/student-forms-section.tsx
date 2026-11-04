"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EMPLOYEE_FORM_STATUS_LABEL, RISK_LEVEL_COLOR, RISK_LEVEL_LABEL, clinicalResultColor, clinicalResultText, type CompanyDashboardResponse, type FormKey } from "@/core/domain/forms/types";
import { getCompanyFormResults } from "@/infrastructure/http/forms-api";
import { EmployeeFormPreviewModal } from "@/presentation/components/admin/companies/employee-form-preview-modal";

import { getPortalFormResults } from "@/infrastructure/http/company-portal-api";

const guides: { key: FormKey; title: string; description: string }[] = [
  { key: "nom035_guia1", title: "Guía I", description: "Acontecimientos traumáticos severos" },
  { key: "nom035_guia2", title: "Guía II", description: "Factores de riesgo psicosocial" },
  { key: "nom035_guia3", title: "Guía III", description: "Riesgo psicosocial y entorno organizacional" },
  { key: "nom035_guia5", title: "Guía V", description: "Perfil personal y laboral" },
];

export function StudentFormsSection({ companyId, studentId, employeeName, readOnly = false }: { readOnly?: boolean; companyId: string | null; studentId: string; employeeName: string }) {
  const [data, setData] = useState<CompanyDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<FormKey | null>(null);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (readOnly ? getPortalFormResults() : getCompanyFormResults(companyId)).then(result => {
      if (!cancelled) { setData(result); setError(null); }
    }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "No se pudieron cargar los formularios."); });
    return () => { cancelled = true; };
  }, [companyId, revision, readOnly]);

  if (!companyId) return <div className="rounded-2xl border border-brand-line bg-white p-8"><h2 className="font-display text-xl font-bold">Formularios NOM-035</h2><p className="mt-3 text-sm text-brand-muted">El alumno no tiene una empresa vinculada. Vincula su empresa en Datos del alumno para consultar las guías asignadas y sus respuestas.</p></div>;
  if (error) return <div role="alert" className="rounded-2xl border border-brand-line bg-white p-6"><p className="text-sm text-red-700">{error}</p><button type="button" onClick={() => setRevision(r => r + 1)} className="mt-3 text-sm font-semibold text-brand-blue">Reintentar</button></div>;
  if (!data) return <p className="text-sm text-brand-muted">Cargando formularios y resultados...</p>;
  const employee = data.employees.find(e => e.studentId === studentId);
  if (!employee) return <p className="rounded-2xl border border-brand-line bg-white p-6 text-sm text-brand-muted">No se encontró al alumno entre los empleados de esta empresa.</p>;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Formularios NOM-035</h2><p className="mt-1 text-sm text-brand-muted">Última asignación por guía de su empresa. Los resultados se muestran cuando la evaluación está completa.</p></div>{!readOnly && <Link href={`/admin/empresas/${companyId}?tab=formularios`} className="text-sm font-semibold text-brand-blue hover:underline">Ver formularios de la empresa →</Link>}</div>
    <div className="grid items-stretch gap-5 xl:grid-cols-2">{guides.map(guide => {
      const cell = employee.forms[guide.key];
      const assigned = guide.key === "nom035_guia5" || data.assignedFormKeys.includes(guide.key);
      const status = !assigned ? "No asignada" : cell?.status === "not_assigned" || !cell ? "Sin aplicar" : EMPLOYEE_FORM_STATUS_LABEL[cell.status];
      const result = cell?.status === "completed" ? cell.result : null;
      return <article key={guide.key} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-brand-line bg-brand-light/40 p-5"><div><h3 className="font-display text-lg font-bold">{guide.title}</h3><p className="mt-1 text-sm text-brand-muted">{guide.description}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cell?.status === "completed" && assigned ? "bg-slate-100 text-slate-700" : "bg-brand-light text-brand-muted"}`}>{status}</span></div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          {guide.key === "nom035_guia5" ? <div className="rounded-xl bg-brand-light p-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Estado de captura</p><p className="mt-2 text-xl font-bold text-brand-gray">{status}</p><p className="mt-2 text-sm text-brand-muted">Datos personales y laborales. No genera puntaje ni nivel de riesgo.</p></div> : result ? <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Resultado de la evaluación</p>
            {result.requiresClinicalAssessment != null ? <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={clinicalResultColor(result.requiresClinicalAssessment)}>{result.resultText ?? clinicalResultText(result.requiresClinicalAssessment)}</p> : <div className="flex flex-wrap items-center gap-3"><span className="text-3xl font-bold tabular-nums">{result.total ?? "—"}<span className="ml-1 text-sm font-normal text-brand-muted">puntos</span></span>{result.level && <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={RISK_LEVEL_COLOR[result.level]}>{RISK_LEVEL_LABEL[result.level]}</span>}</div>}
            {result.completedAt && <p className="text-xs text-brand-muted">Completada: {new Date(result.completedAt).toLocaleDateString("es-MX")}</p>}
            {result.action && <details className="rounded-xl border border-brand-line"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-brand-blue">Necesidad de acción</summary><p className="border-t border-brand-line px-4 py-3 text-sm leading-relaxed text-brand-muted">{result.action}</p></details>}
            {result.categories.length > 0 && <details className="rounded-xl border border-brand-line"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-brand-blue">Ver categorías y dominios</summary><div className="space-y-4 border-t border-brand-line p-4">{result.categories.map(category => <div key={category.key}><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><strong>{category.name}</strong><span className="rounded-md px-2 py-1 text-xs font-semibold" style={RISK_LEVEL_COLOR[category.level]}>{RISK_LEVEL_LABEL[category.level]} · {category.value} pts</span></div><ul className="mt-2 space-y-2">{result.domains.filter(domain => domain.categoryKey === category.key).map(domain => <li key={domain.key} className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-brand-muted">{domain.name}</span><span className="rounded px-2 py-1" style={RISK_LEVEL_COLOR[domain.level]}>{RISK_LEVEL_LABEL[domain.level]} · {domain.value} pts</span></li>)}</ul></div>)}</div></details>}
          </> : <p className="text-sm text-brand-muted">{assigned ? "Aún no hay un resultado completo para esta guía." : "Esta guía no está asignada a su empresa."}</p>}
          <div className="mt-auto border-t border-brand-line pt-4">
            {assigned && (!readOnly || cell?.status === "completed" || cell?.status === "partial") ? <button type="button" onClick={() => setSelected(guide.key)} className="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light">{cell?.status === "not_applied" || !cell ? "Capturar formulario" : "Ver respuestas"}</button> : <p className="py-2 text-center text-xs text-brand-muted">{assigned ? "Sin respuestas disponibles" : "Disponible al asignar la guía en su empresa"}</p>}
          </div>
        </div>
      </article>;
    })}</div>
    {selected && <EmployeeFormPreviewModal readOnly={readOnly} companyId={companyId} studentId={studentId} employeeName={employeeName} formKey={selected} onClose={() => setSelected(null)} onSaved={() => setRevision(r => r + 1)} />}
  </div>;
}
