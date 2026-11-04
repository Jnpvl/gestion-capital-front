"use client";

import { Fragment, useEffect, useState } from "react";
import { CompanyDashboardDemographics } from "./company-dashboard-demographics";
import { CompanyDashboardClinical } from "./company-dashboard-clinical";
import { CompanyDashboardCharts } from "./company-dashboard-charts";
import {
  EMPLOYEE_FORM_STATUS_LABEL,
  RISK_LEVEL_COLOR,
  RISK_LEVEL_LABEL,
  clinicalResultColor,
  clinicalResultText,
  type CompanyDashboardResponse,
  type DashboardFormCell,
  type FormKey,
} from "@/core/domain/forms/types";
import { getCompanyFormResults } from "@/infrastructure/http/forms-api";
import { getPortalFormResults } from "@/infrastructure/http/company-portal-api";
import { showError } from "@/shared/lib/alerts";
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
export function CompanyDashboardTab({
  companyId,
  readOnly = false,
}: {
  companyId: string;
  readOnly?: boolean;
}) {
  const [data, setData] = useState<CompanyDashboardResponse | null>(null);
  const [view, setView] = useState("general");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (readOnly ? getPortalFormResults() : getCompanyFormResults(companyId))
      .then(setData)
      .catch((err) => {
        showError(err instanceof Error ? err.message : "Error al cargar el dashboard");
        setData({ assignedFormKeys: [], employees: [] });
      });
  }, [companyId, readOnly]);

  if (!data) return <div className="text-sm text-brand-muted">Cargando dashboard...</div>;

  const tabs = [
    { id: "general", label: "Resultados generales" },
    { id: "clinical", label: "Guía I · Valoración clínica" },
    ...(data.assignedFormKeys.includes("nom035_guia2") ? [{ id: "psychosocial2", label: "Riesgo psicosocial II" }] : []),
    ...(data.assignedFormKeys.includes("nom035_guia3") ? [{ id: "psychosocial3", label: "Riesgo psicosocial III" }] : []),
    { id: "demographics", label: "Guía V · Perfil de trabajadores" },
  ];
  const activeView = tabs.some(tab => tab.id === view) ? view : "general";

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-brand-line bg-white p-1.5 shadow-sm" role="tablist" aria-label="Vistas del dashboard" onKeyDown={(event) => {
      const ids = tabs.map(tab => tab.id);
      const index = ids.indexOf(activeView);
      const next = event.key === "ArrowRight" ? (index + 1) % ids.length : event.key === "ArrowLeft" ? (index + ids.length - 1) % ids.length : event.key === "Home" ? 0 : event.key === "End" ? ids.length - 1 : null;
      if (next !== null) {
        event.preventDefault();
        setView(ids[next]);
        document.getElementById(`dashboard-view-${ids[next]}`)?.focus();
      }
    }}>
      {tabs.map(tab => <button key={tab.id} id={`dashboard-view-${tab.id}`} type="button" role="tab" aria-selected={activeView === tab.id} aria-controls={`dashboard-panel-${tab.id}`} tabIndex={activeView === tab.id ? 0 : -1} onClick={() => setView(tab.id)} className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeView === tab.id ? "bg-brand-blue text-white" : "text-brand-muted hover:bg-brand-light"}`}>{tab.label}</button>)}
    </div>
    {data.assignedFormKeys.includes("nom035_guia2") && <div id="dashboard-panel-psychosocial2" role="tabpanel" aria-labelledby="dashboard-view-psychosocial2" hidden={activeView !== "psychosocial2"}>
      <CompanyDashboardCharts data={data} guide="nom035_guia2" />
    </div>}
    {data.assignedFormKeys.includes("nom035_guia3") && <div id="dashboard-panel-psychosocial3" role="tabpanel" aria-labelledby="dashboard-view-psychosocial3" hidden={activeView !== "psychosocial3"}>
      <CompanyDashboardCharts data={data} guide="nom035_guia3" />
    </div>}
    <div id="dashboard-panel-clinical" role="tabpanel" aria-labelledby="dashboard-view-clinical" hidden={activeView !== "clinical"}>
      <CompanyDashboardClinical data={data} />
    </div>
    <div id="dashboard-panel-demographics" role="tabpanel" aria-labelledby="dashboard-view-demographics" hidden={activeView !== "demographics"}>
      <CompanyDashboardDemographics data={data.demographics} />
    </div>
    <div id="dashboard-panel-general" role="tabpanel" aria-labelledby="dashboard-view-general" hidden={activeView !== "general"}>
    <div className="rounded-2xl border border-brand-line bg-white">
      <div className="border-b border-brand-line p-6">
        <h2 className="font-display text-lg font-bold text-brand-gray">Resultados generales</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Vista general por empleado. «No aplica»: la guía no está asignada a la empresa. «N/A»: aún
          sin resultado. Clic en un resultado de Guía II o III para ver el detalle y la necesidad de acción.
        </p>
      </div>
      {data.employees.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          Esta empresa aún no tiene empleados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-6 py-3.5 font-semibold">Empleado</th>
                {GUIDES.map((g) => (
                  <th key={g.key} className="px-4 py-3.5 font-semibold">{g.label}</th>
                ))}
                <th className="px-6 py-3.5 font-semibold">Guía V</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {data.employees.map((e) => {
                const openKey = GUIDES.find((g) => open === `${e.studentId}:${g.key}`)?.key;
                const detail = openKey ? e.forms[openKey]?.result : null;
                const g5 = e.forms.nom035_guia5?.status ?? "pending";
                const g5Label = EMPLOYEE_FORM_STATUS_LABEL[g5 === "not_applied" || g5 === "not_assigned" ? "pending" : g5];
                return (
                  <Fragment key={e.studentId}>
                    <tr>
                      <td className="px-6 py-4 font-medium text-brand-gray">{e.employeeName}</td>
                      {GUIDES.map((g) => {
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
                      <td className="whitespace-nowrap px-6 py-4 text-brand-gray">{g5Label}</td>
                    </tr>
                    {detail && (
                      <tr className="bg-brand-light/30">
                        <td colSpan={5} className="px-6 py-4">
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
