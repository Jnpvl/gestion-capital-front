"use client";

import { useState } from "react";
import type { CompanyDashboardResponse, DashboardEmployee } from "@/core/domain/forms/types";
import { downloadIndividualReport } from "@/infrastructure/http/individual-reports-api";
import { DashboardEmployeeLink } from "./dashboard-employee-link";

export function CompanyDashboardReports({ data, companyId, readOnly, returnTo }: {
  data: CompanyDashboardResponse; companyId: string; readOnly: boolean; returnTo: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function download(employee: DashboardEmployee, guide?: "nom035_guia2" | "nom035_guia3") {
    if (busy) return;
    setBusy(employee.studentId); setError("");
    try { await downloadIndividualReport({ companyId, studentId: employee.studentId, year: data.evaluationYear, portal: readOnly, guide }); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo generar el reporte"); }
    finally { setBusy(null); }
  }
  return <section className="rounded-2xl border border-brand-line bg-white">
    <header className="border-b border-brand-line p-5 sm:p-6"><h2 className="font-display text-xl font-bold">Reportes individuales · {data.evaluationYear}</h2><p className="mt-2 text-sm text-brand-muted">Resultados y respuestas de cada empleado, con los datos de la empresa y el perfil de Guía V del año seleccionado.</p></header>
    {error && <p role="alert" className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {data.employees.length ? <table className="responsive-table text-left text-sm">
      <thead className="bg-brand-light text-brand-muted"><tr><th className="px-5 py-3">Empleado</th><th className="px-5 py-3">Evaluaciones disponibles</th><th className="px-5 py-3">Reporte PDF</th></tr></thead>
      <tbody className="divide-y divide-brand-line">{data.employees.map(employee => {
        const available = (["nom035_guia1", "nom035_guia2", "nom035_guia3", "nom035_guia5"] as const).filter(key =>
          ["completed", "partial"].includes(employee.forms[key]?.status ?? "") && (key === "nom035_guia5" || data.assignedFormKeys.includes(key)));
        const risks = (["nom035_guia2", "nom035_guia3"] as const).filter(key => available.includes(key));
        const choices = risks.length > 1 ? risks : [risks[0]];
        const labels = { nom035_guia1: "Guía I", nom035_guia2: "Guía II", nom035_guia3: "Guía III", nom035_guia5: "Guía V" };
        return <tr key={employee.studentId}>
          <td data-label="Empleado" className="px-5 py-4 align-top"><DashboardEmployeeLink studentId={employee.studentId} name={employee.employeeName} readOnly={readOnly} returnTo={returnTo} /></td>
          <td data-label="Evaluaciones disponibles" className="px-5 py-4"><div className="flex flex-wrap gap-2">{available.map(key => <span key={key} className="rounded-md bg-brand-light px-2 py-1 text-xs">{labels[key]}{employee.forms[key]?.status === "partial" ? " · Parcial" : ""}</span>)}{!available.length && <span className="text-brand-muted">Sin respuestas en este año</span>}</div></td>
          <td data-label="Reporte PDF" className="px-5 py-4"><div className="flex flex-wrap gap-2">{choices.map(guide => <button key={guide ?? "report"} type="button" disabled={!available.length || busy !== null} onClick={() => void download(employee, guide)} className="rounded-lg border border-brand-line px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50">{busy === employee.studentId ? "Generando…" : `Descargar PDF${risks.length > 1 && guide ? ` · ${labels[guide]}` : ""}`}</button>)}</div></td>
        </tr>;
      })}</tbody>
    </table> : <p className="p-6 text-sm text-brand-muted">No hay empleados que coincidan con los filtros seleccionados.</p>}
  </section>;
}
