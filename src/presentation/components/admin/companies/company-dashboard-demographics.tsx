"use client";

import { EmployeeRiskBar } from "./employee-risk-bar";
import type { DashboardEmployee } from "@/core/domain/forms/types";
import { useState } from "react";
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL, type RiskLevel, type DemographicRiskGuide, type DashboardDemographics } from "@/core/domain/forms/types";

const levels: (RiskLevel | "sin_resultado")[] = ["nulo", "bajo", "medio", "alto", "muy_alto", "sin_resultado"];
const riskColor = (level: typeof levels[number]) => level === "sin_resultado" ? "#cbd5e1" : RISK_LEVEL_COLOR[level].background;

const format = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const sections = [
  { title: "Perfil personal", description: "Características de las personas que integran la empresa.", keys: ["sexo", "edad", "estado_civil", "nivel_estudios"], color: "#2e3192" },
  { title: "Puesto y contratación", description: "Distribución del equipo y sus condiciones de contratación.", keys: ["puesto", "departamento", "tipo_puesto", "tipo_contratacion", "tipo_personal"], color: "#0f766e" },
  { title: "Jornada y experiencia", description: "Horarios, rotación de turnos y trayectoria laboral.", keys: ["tipo_jornada", "rotacion_turnos", "tiempo_puesto", "tiempo_experiencia"], color: "#8b5e20" },
];

export function CompanyDashboardDemographics({ data, employees, readOnly, returnTo }: { data?: DashboardDemographics; employees: DashboardEmployee[]; readOnly: boolean; returnTo: string }) {
  const [guide, setGuide] = useState<DemographicRiskGuide | null>(null);
  const available = data?.riskGuides ?? [];
  const selectedGuide = available.find(key => key === guide) ?? available[0];
  const guideLabel = selectedGuide === "nom035_guia2" ? "Guía II" : "Guía III";
  const riskLabel = (level: typeof levels[number]) => level === "sin_resultado" ? `Sin evaluación completa · ${guideLabel}` : RISK_LEVEL_LABEL[level];
  const coverage = data?.total ? data.completed / data.total * 100 : 0;
  return <section className="space-y-8" aria-label="Perfil de trabajadores de Guía V">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Bienestar en tu empresa</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">Perfil de trabajadores · Guía V</h2>
      <p className="mt-2 max-w-3xl text-sm text-brand-muted">Avance de las fichas demográficas de Guía V y distribución del riesgo evaluado en Guía II o III.</p>
    </div>
    {!data ? <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">No se pudo obtener el resumen de Guía V. Actualiza la página para volver a consultar los datos.</div> : <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-gray">Avance de captura · Guía V</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
          { label: "Fichas completas", value: `${data.completed} / ${data.total}`, note: "Guía V capturada en su totalidad", accent: "#475569" },
          { label: "Fichas parciales", value: data.partial, note: "Guía V con información por completar", accent: "#94a3b8" },
          { label: "Sin ficha capturada", value: Math.max(0, data.total - data.completed - data.partial), note: "Guía V aún sin responder", accent: "#cbd5e1" },
          { label: "Cobertura de captura", value: `${format.format(coverage)}%`, note: "Fichas completas sobre el total de empleados", accent: "#64748b" },
        ].map(card => <div key={card.label} className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: card.accent }} aria-hidden="true" />
          <p className="text-xs font-semibold text-brand-muted">{card.label}</p>
          <p className="mt-3 text-3xl font-bold tabular-nums text-brand-gray">{card.value}</p>
          <p className="mt-2 text-xs leading-relaxed text-brand-muted">{card.note}</p>
        </div>)}</div>
      </div>
      <div className="space-y-4 rounded-2xl border border-brand-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold text-brand-gray">{selectedGuide ? `Riesgo según ${guideLabel}` : "Riesgo por grupo"}</h3><p className="mt-1 text-sm text-brand-muted">{selectedGuide ? `Resultado global individual de ${selectedGuide === "nom035_guia2" ? "Guía II" : "Guía III"}, cruzado con la ficha de Guía V.` : "Asigna la Guía II o III para ver la distribución de riesgo."}</p></div>
        {available.length > 1 && <div className="flex gap-1 rounded-xl bg-brand-light p-1" aria-label="Guía para el cruce demográfico">{available.map(key => <button key={key} type="button" aria-pressed={selectedGuide === key} onClick={() => setGuide(key)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${selectedGuide === key ? "bg-brand-blue text-white" : "text-brand-muted"}`}>{key === "nom035_guia2" ? "Guía II" : "Guía III"}</button>)}</div>}</div>
        {selectedGuide && <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">{levels.map(level => <span key={level} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-black/10" style={{ background: riskColor(level) }} />{riskLabel(level)}</span>)}</div>}
        {selectedGuide && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600"><strong>Gris: sin evaluación completa de {guideLabel}.</strong> La persona puede tener su ficha de Guía V completa y seguir en gris. El avance de captura y el resultado de riesgo son independientes.</p>}
        <p className="text-xs leading-relaxed text-brand-muted">La columna % indica la participación del grupo entre las respuestas de la variable. Cada barra de riesgo representa el 100% del grupo, incluyendo en gris a quienes no tienen evaluación completa de la guía seleccionada. Por ejemplo: 1 de 5 personas en muy alto equivale a 20% rojo. Se incluyen fichas completas y parciales.</p>
      </div>
      {sections.map((section, index) => <section key={section.title} className="space-y-4" aria-label={section.title}>
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold shadow-sm ring-1 ring-brand-line" style={{ color: section.color }}>0{index + 1}</span><div><h3 className="font-display text-lg font-bold text-brand-gray">{section.title}</h3><p className="mt-0.5 text-xs text-brand-muted">{section.description}</p></div></div>
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">{data.fields.filter(field => section.keys.includes(field.key)).map(field => <div key={field.key} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm">
          <div className="border-b border-brand-line bg-brand-light/40 px-5 py-4"><h4 className="text-base font-bold text-brand-gray">{field.name}</h4><div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-md bg-white px-2 py-1 font-medium text-brand-muted ring-1 ring-brand-line">{field.answered} respuestas</span>{data.total > field.answered && <span className="text-brand-muted">{data.total - field.answered} sin dato</span>}</div></div>
          {field.groups.length ? <div className="flex-1 px-5 pb-4">
            <div className="grid grid-cols-[minmax(0,1fr)_3rem_4.5rem] gap-3 border-b border-brand-line py-3 text-xs font-semibold uppercase tracking-wide text-brand-muted"><span>Grupo</span><span className="text-right">Total</span><span className="text-right">%</span></div>
            <div className="divide-y divide-brand-line">{field.groups.map(group => {
            const risks = selectedGuide ? group.risks?.[selectedGuide] : undefined;
            const percentage = field.answered ? group.count / field.answered * 100 : 0;
            return <div key={group.name} className="py-3.5">
              <div className="grid grid-cols-[minmax(0,1fr)_3rem_4.5rem] items-start gap-3 text-sm leading-relaxed">
                <span className="min-w-0 break-words font-medium text-brand-gray">{group.name}</span>
                <span className="text-right tabular-nums text-brand-gray">{group.count}</span>
                <strong className="text-right tabular-nums" style={{ color: section.color }}>{format.format(percentage)}%</strong>
              </div>
              {risks ? <>
                <p className="mt-3 text-[11px] font-semibold text-brand-muted">Riesgo según {guideLabel} · {group.count} personas en este grupo</p>
                <div className="mt-3"><EmployeeRiskBar key={selectedGuide} label={`${field.name} · ${group.name} · ${guideLabel}`} readOnly={readOnly} returnTo={returnTo} segments={levels.map(level => ({
                  key: level, label: riskLabel(level), color: riskColor(level), count: risks[level],
                  people: employees.filter(employee => {
                    if (!group.studentIds?.includes(employee.studentId) || !selectedGuide) return false;
                    const cell = employee.forms[selectedGuide];
                    const employeeLevel = cell?.status === "completed" ? cell.result?.level ?? "sin_resultado" : "sin_resultado";
                    return employeeLevel === level;
                  }).map(employee => ({ studentId: employee.studentId, name: employee.employeeName })),
                }))}/></div>
              </> : <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-light" aria-hidden="true"><div className="h-full rounded-full" style={{ width: `${percentage}%`, background: section.color }} /></div>}

            </div>;
          })}</div></div> : <p className="p-5 text-sm text-brand-muted">Aún no hay respuestas para esta variable.</p>}
        </div>)}</div>
      </section>)}
    </>}
  </section>;
}
