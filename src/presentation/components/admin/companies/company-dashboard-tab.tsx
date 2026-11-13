"use client";

import { DashboardEmployeeLink } from "./dashboard-employee-link";
import { EmployeeRecordNumber } from "./employee-record-number";
import { useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import { CompanyDashboardDemographicFilters } from "./company-dashboard-demographic-filters";
import { CompanyDashboardDemographics } from "./company-dashboard-demographics";
import { CompanyDashboardClinical } from "./company-dashboard-clinical";
import { CompanyDashboardCharts } from "./company-dashboard-charts";
import { CompanyDashboardGuia4 } from "./company-dashboard-guia4";
import {
  EMPLOYEE_FORM_STATUS_LABEL,
  RISK_LEVEL_COLOR,
  RISK_LEVEL_LABEL,
  clinicalResultColor,
  clinicalResultText,
  samplingBadgeLabel,
  type CompanyDashboardResponse,
  type DashboardFormCell,
  type FormKey,
} from "@/core/domain/forms/types";
import { getCompanyFormResults } from "@/infrastructure/http/forms-api";
import { getPortalFormResults } from "@/infrastructure/http/company-portal-api";
import { showError } from "@/shared/lib/alerts";
import {
  DEMOGRAPHIC_FILTER_ALL,
  applyDemographicFilters,
} from "@/shared/lib/dashboard-demographic-filters";
import type { RiskLevel } from "@/core/domain/forms/types";

/** Píldora con el color del nivel (colores de las tablas de la NOM-035). */
function LevelPill({ level, children }: { level: RiskLevel; children: React.ReactNode }) {
  return (
    <span
      style={RISK_LEVEL_COLOR[level]}
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      {children}
    </span>
  );
}

const GUIDES: { key: FormKey; label: string }[] = [
  { key: "nom035_guia1", label: "Guía I" },
  { key: "nom035_guia2", label: "Guía II" },
  { key: "nom035_guia3", label: "Guía III" },
];

function GuideCell({
  cell,
  isOpen,
  onToggle,
}: {
  cell: DashboardFormCell | undefined;
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (!cell || cell.status === "not_assigned") {
    return <span className="text-brand-muted">No aplica</span>;
  }
  if (cell.status === "not_selected") {
    return (
      <span className="text-xs font-medium text-slate-500" title="No seleccionado para el muestreo">
        No seleccionado para el muestreo
      </span>
    );
  }
  const r = cell.result;
  if (!r) {
    const note = cell.status === "partial" ? "Parcial" : cell.status === "pending" ? "Pendiente" : null;
    return (
      <span className="text-brand-muted">
        N/A{note && <span className="ml-1 text-xs text-brand-muted/70">· {note}</span>}
      </span>
    );
  }
  const text =
    r.requiresClinicalAssessment != null
      ? (r.resultText ?? clinicalResultText(r.requiresClinicalAssessment))
      : `${r.levelLabel ?? "—"} (${r.total ?? 0} pts)`;
  // Guía I: solo el resultado literal, sin detalle desplegable.
  if (r.requiresClinicalAssessment != null) {
    return (
      <span
        style={clinicalResultColor(r.requiresClinicalAssessment)}
        className="inline-block rounded-lg px-2.5 py-1 text-xs font-semibold"
      >
        {text}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-left font-semibold text-brand-gray hover:opacity-80"
      title="Ver detalle y necesidad de acción"
    >
      <span className="mr-1 inline-block w-3 text-brand-muted">{isOpen ? "▾" : "▸"}</span>
      {r.level ? <LevelPill level={r.level}>{text}</LevelPill> : text}
    </button>
  );
}

/** readOnly: portal de empresa (datos del token de empresa, sin companyId de la URL). */
export function CompanyDashboardTab(props: { companyId: string; readOnly?: boolean }) {
  return <Suspense fallback={<p>Cargando NOM-035...</p>}><DashboardContent {...props} /></Suspense>;
}

function DashboardContent({
  companyId,
  readOnly = false,
}: {
  companyId: string;
  readOnly?: boolean;
}) {
  const [data, setData] = useState<CompanyDashboardResponse | null>(null);
  const searchParams = useSearchParams();
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(searchParams.get("nomYear") || currentYear);
  const [view, setView] = useState(searchParams.get("dashboardView") || "general");
  const dashboardUrl = readOnly ? "/empresa/nom-035" : `/admin/empresas/${companyId}?tab=dashboard`;
  const returnTo = `${dashboardUrl}${readOnly ? "?" : "&"}nomYear=${encodeURIComponent(year)}&dashboardView=${encodeURIComponent(view)}`;
  const [open, setOpen] = useState<string | null>(null);
  const [departamento, setDepartamento] = useState(DEMOGRAPHIC_FILTER_ALL);
  const [puesto, setPuesto] = useState(DEMOGRAPHIC_FILTER_ALL);
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setDepartamento(DEMOGRAPHIC_FILTER_ALL);
    setPuesto(DEMOGRAPHIC_FILTER_ALL);
    (readOnly ? getPortalFormResults(year) : getCompanyFormResults(companyId, year))
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        showError(err instanceof Error ? err.message : "Error al cargar NOM-035");
        setData({ evaluationYear: Number(year), evaluationYears: [], assignedFormKeys: [], employees: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, readOnly, year]);

  // Solo años con evaluación real. Si el seleccionado no existe, ir al más reciente.
  useEffect(() => {
    if (!data) return;
    const options = [...new Set((data.evaluationYears ?? []).map(String))].sort(
      (a, b) => Number(b) - Number(a),
    );
    if (options.length > 0 && !options.includes(year)) {
      setYear(options[0]);
    }
  }, [data, year]);

  if (!data) return <div className="text-sm text-brand-muted">Cargando NOM-035...</div>;

  const yearOptions = Array.from(new Set((data.evaluationYears ?? []).map(String))).sort(
    (a, b) => Number(b) - Number(a),
  );
  const activeYear = yearOptions.includes(year) ? year : (yearOptions[0] ?? year);

  if (yearOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">
        Aún no hay evaluaciones NOM-035. Asigna una guía en la pestaña Formularios para empezar.
      </div>
    );
  }

  const assigned = new Set(data.assignedFormKeys ?? []);
  const hasGuia5 =
    (data.demographics?.total ?? 0) > 0 ||
    data.employees.some((employee) => {
      const status = employee.forms.nom035_guia5?.status;
      return status === "completed" || status === "partial" || status === "pending";
    });
  const tabs = [
    { id: "general", label: "Resultados generales" },
    assigned.has("nom035_guia1") && { id: "clinical", label: "Guía I" },
    assigned.has("nom035_guia2") && { id: "psychosocial2", label: "Guía II" },
    assigned.has("nom035_guia3") && { id: "psychosocial3", label: "Guía III" },
    { id: "guia4", label: "Guía IV" },
    hasGuia5 && { id: "demographics", label: "Guía V" },
  ].filter(Boolean) as { id: string; label: string }[];
  const activeView = tabs.some((tab) => tab.id === view) ? view : (tabs[0]?.id ?? "general");
  const guia3Sampling = data.sampling?.nom035_guia3 ?? null;
  const samplingBadge = samplingBadgeLabel(guia3Sampling);
  const filteredData = applyDemographicFilters(data, departamento, puesto, employeeSearch);
  const generalEmployees = filteredData.employees;
  const guia3ChartData =
    guia3Sampling?.mode === "sample"
      ? {
          ...filteredData,
          employees: filteredData.employees.filter((employee) =>
            guia3Sampling.selectedStudentIds.includes(employee.studentId),
          ),
        }
      : filteredData;
  const showDemographicFilters =
    activeView === "clinical" ||
    activeView === "psychosocial2" ||
    activeView === "psychosocial3" || activeView === "demographics";

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
    <div
      className={`${activeView === "general" || showDemographicFilters ? "hidden" : "flex"} flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-white p-1.5 shadow-sm`}
      role="tablist"
      aria-label="Año de evaluación NOM-035"
      hidden={activeView === "general" || showDemographicFilters}
    >
      <span className="shrink-0 px-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Año
      </span>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {yearOptions.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={activeYear === option}
            onClick={() => setYear(option)}
            className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
              activeYear === option
                ? "bg-brand-gray text-white"
                : "text-brand-muted hover:bg-brand-light"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
    <div
      className="flex items-center gap-2 rounded-2xl border border-brand-line bg-white p-1.5 shadow-sm"
      role="tablist"
      aria-label="Vistas NOM-035"
      onKeyDown={(event) => {
      const ids = tabs.map(tab => tab.id);
      const index = ids.indexOf(activeView);
      const next = event.key === "ArrowRight" ? (index + 1) % ids.length : event.key === "ArrowLeft" ? (index + ids.length - 1) % ids.length : event.key === "Home" ? 0 : event.key === "End" ? ids.length - 1 : null;
      if (next !== null) {
        event.preventDefault();
        setView(ids[next]);
        document.getElementById(`dashboard-view-${ids[next]}`)?.focus();
      }
    }}>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`dashboard-view-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeView === tab.id}
            aria-controls={`dashboard-panel-${tab.id}`}
            tabIndex={activeView === tab.id ? 0 : -1}
            onClick={() => setView(tab.id)}
            className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
              activeView === tab.id ? "bg-brand-blue text-white" : "text-brand-muted hover:bg-brand-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {samplingBadge && (
        <span
          className={`mr-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
            guia3Sampling?.mode === "sample"
              ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
          }`}
          title="Universo de la evaluación Guía III / demografía asociada"
        >
          {samplingBadge}
        </span>
      )}
    </div>
    {(activeView === "general" || showDemographicFilters) && (
      <div className="space-y-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Buscar y filtrar resultados</h3>
            <p className="mt-1 text-xs text-brand-muted">Departamento y puesto corresponden a la Guía V del año seleccionado.</p>
          </div>
          {(employeeSearch || departamento || puesto) && <button type="button"
            onClick={() => { setEmployeeSearch(""); setDepartamento(DEMOGRAPHIC_FILTER_ALL); setPuesto(DEMOGRAPHIC_FILTER_ALL); }}
            className="text-sm font-semibold text-brand-blue hover:underline">Limpiar filtros</button>}
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Año de evaluación</span>
            <select value={activeYear} onChange={event => setYear(event.target.value)}
              className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-gray">
              {yearOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Buscar empleado</span>
            <input type="search" value={employeeSearch} onChange={event => setEmployeeSearch(event.target.value)}
              placeholder="Nombre o número de expediente (UUID)"
              className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue" />
          </label>
        </div>
        <CompanyDashboardDemographicFilters embedded demographics={data.demographics} employees={data.employees}
          departamento={departamento} puesto={puesto} onDepartamentoChange={setDepartamento} onPuestoChange={setPuesto} />
        <p role="status" className="text-xs text-brand-muted">{generalEmployees.length} de {data.employees.length} empleados · Formularios {activeYear}</p>
      </div>
    )}
    <div id="dashboard-panel-psychosocial2" role="tabpanel" aria-labelledby="dashboard-view-psychosocial2" hidden={activeView !== "psychosocial2"}>
      <CompanyDashboardCharts active={activeView === "psychosocial2"} data={filteredData} guide="nom035_guia2" readOnly={readOnly} returnTo={returnTo} />
    </div>
    <div id="dashboard-panel-psychosocial3" role="tabpanel" aria-labelledby="dashboard-view-psychosocial3" hidden={activeView !== "psychosocial3"}>
      <CompanyDashboardCharts active={activeView === "psychosocial3"} data={guia3ChartData} guide="nom035_guia3" readOnly={readOnly} returnTo={returnTo} />
    </div>
    <div id="dashboard-panel-clinical" role="tabpanel" aria-labelledby="dashboard-view-clinical" hidden={activeView !== "clinical"}>
      <CompanyDashboardClinical data={filteredData} readOnly={readOnly} returnTo={returnTo} />
    </div>
    <div id="dashboard-panel-guia4" role="tabpanel" aria-labelledby="dashboard-view-guia4" hidden={activeView !== "guia4"}>
      <CompanyDashboardGuia4 />
    </div>
    <div id="dashboard-panel-demographics" role="tabpanel" aria-labelledby="dashboard-view-demographics" hidden={activeView !== "demographics"}>
      <CompanyDashboardDemographics data={filteredData.demographics} employees={filteredData.employees} readOnly={readOnly} returnTo={returnTo} />
    </div>
    <div id="dashboard-panel-general" role="tabpanel" aria-labelledby="dashboard-view-general" hidden={activeView !== "general"}>
    <div className="rounded-2xl border border-brand-line bg-white">
      <div className="border-b border-brand-line p-6">
        <h2 className="font-display text-lg font-bold text-brand-gray">Resultados generales</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Vista general por empleado. Solo se muestran las guías asignadas. «N/A»: aún sin resultado.
          Clic en un resultado de Guía II o III para ver el detalle y la necesidad de acción.
        </p>
      </div>
      {generalEmployees.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          {data.employees.length ? "No hay empleados que coincidan con la búsqueda y los filtros." : "Esta empresa aún no tiene empleados."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-6 py-3.5 font-semibold">Empleado</th>
                {GUIDES.filter((g) => assigned.has(g.key)).map((g) => (
                  <th key={g.key} className="px-4 py-3.5 font-semibold">{g.label}</th>
                ))}
                {hasGuia5 && <th className="px-6 py-3.5 font-semibold">Guía V</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {generalEmployees.map((e) => {
                const visibleGuides = GUIDES.filter((g) => assigned.has(g.key));
                const openKey = visibleGuides.find((g) => open === `${e.studentId}:${g.key}`)?.key;
                const detail = openKey ? e.forms[openKey]?.result : null;
                const g5 = e.forms.nom035_guia5?.status ?? "pending";
                const g5Label =
                  EMPLOYEE_FORM_STATUS_LABEL[
                    g5 === "not_applied" || g5 === "not_assigned" || g5 === "not_selected"
                      ? "pending"
                      : g5
                  ];
                const colSpan = 1 + visibleGuides.length + (hasGuia5 ? 1 : 0);
                return (
                  <Fragment key={e.studentId}>
                    <tr>
                      <td className="min-w-60 px-6 py-4 align-top font-medium text-brand-gray">
                        <DashboardEmployeeLink studentId={e.studentId} name={e.employeeName} readOnly={readOnly} returnTo={returnTo} />
                        <EmployeeRecordNumber id={e.studentId} />
                      </td>
                      {visibleGuides.map((g) => {
                        const id = `${e.studentId}:${g.key}`;
                        return (
                          <td key={g.key} className="min-w-44 px-4 py-4 align-top">
                            <GuideCell
                              cell={e.forms[g.key]}
                              isOpen={open === id}
                              onToggle={() => setOpen(open === id ? null : id)}
                            />
                          </td>
                        );
                      })}
                      {hasGuia5 && (
                        <td className="whitespace-nowrap px-6 py-4 text-brand-gray">{g5Label}</td>
                      )}
                    </tr>
                    {detail && (
                      <tr className="bg-brand-light/30">
                        <td colSpan={colSpan} className="px-6 py-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                            {GUIDES.find((g) => g.key === openKey)?.label} · Necesidad de acción
                            {detail.completedAt &&
                              ` · ${new Date(detail.completedAt).toLocaleDateString("es-MX")}`}
                          </p>
                          <p className="mt-1 text-sm text-brand-gray">{detail.action}</p>
                          {detail.categories.length > 0 && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              {detail.categories.map((c) => (
                                <div key={c.key} className="rounded-xl border border-brand-line bg-white p-4">
                                  <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-semibold text-brand-gray">{c.name}</span>
                                    <LevelPill level={c.level}>
                                      {RISK_LEVEL_LABEL[c.level]} · {c.value} pts
                                    </LevelPill>
                                  </div>
                                  <ul className="mt-2 space-y-1">
                                    {detail.domains
                                      .filter((d) => d.categoryKey === c.key)
                                      .map((d) => (
                                        <li key={d.key} className="flex items-center justify-between gap-3 text-xs text-brand-muted">
                                          <span>{d.name}</span>
                                          <LevelPill level={d.level}>
                                            {RISK_LEVEL_LABEL[d.level]} · {d.value} pts
                                          </LevelPill>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}
