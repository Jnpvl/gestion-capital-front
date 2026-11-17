import { RISK_LEVEL_LABEL, type CompanyDashboardResponse } from "@/core/domain/forms/types";
import { DashboardEmployeeLink } from "./dashboard-employee-link";

export function CompanyDashboardReferrals({ data, readOnly, returnTo }: {
  data: CompanyDashboardResponse; readOnly: boolean; returnTo: string;
}) {
  const rows = [...new Map(data.employees.map(employee => [employee.studentId, employee])).values()].flatMap(employee => {
    const reasons: { guide: string; detail: string }[] = [];
    const clinical = employee.forms.nom035_guia1;
    if (data.assignedFormKeys.includes("nom035_guia1") && clinical?.status === "completed" && clinical.result?.requiresClinicalAssessment === true) {
      reasons.push({ guide: "Guía I", detail: "Requiere valoración clínica" });
    }
    for (const key of ["nom035_guia2", "nom035_guia3"] as const) {
      if (!data.assignedFormKeys.includes(key)) continue;
      const sample = data.sampling?.nom035_guia3;
      if (key === "nom035_guia3" && sample?.mode === "sample" && !sample.selectedStudentIds.includes(employee.studentId)) continue;
      const cell = employee.forms[key];
      const result = cell?.result;
      if (cell?.status !== "completed" || !result || result.total == null || !Number.isFinite(result.total) || !result.level) continue;
      const violence = result.domains.find(domain => domain.key === "violencia")?.level;
      const details: string[] = [];
      if (result.level === "alto" || result.level === "muy_alto") details.push(`Riesgo general: ${RISK_LEVEL_LABEL[result.level]}`);
      if (violence === "alto" || violence === "muy_alto") details.push(`Violencia: ${RISK_LEVEL_LABEL[violence]}`);
      if (details.length) reasons.push({ guide: key === "nom035_guia2" ? "Guía II" : "Guía III", detail: details.join(" · ") });
    }
    return reasons.length ? [{ employee, reasons }] : [];
  }).sort((a, b) => a.employee.employeeName.localeCompare(b.employee.employeeName, "es"));

  return <section className="rounded-2xl border border-brand-line bg-white">
    <header className="border-b border-brand-line p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Canalizaciones · {data.evaluationYear}</h2>
      <p className="mt-2 text-sm text-brand-muted">{rows.length} empleados requieren seguimiento</p>
    </header>
    {rows.length ? <table className="responsive-table text-left text-sm">
      <thead className="bg-brand-light text-brand-muted"><tr><th className="px-5 py-3">Empleado</th><th className="px-5 py-3">Guías y motivos de seguimiento</th><th className="px-5 py-3">Estatus</th></tr></thead>
      <tbody className="divide-y divide-brand-line">{rows.map(({ employee, reasons }) => <tr key={employee.studentId}>
        <td data-label="Empleado" className="px-5 py-4 align-top"><DashboardEmployeeLink studentId={employee.studentId} name={employee.employeeName} readOnly={readOnly} returnTo={returnTo} /></td>
        <td data-label="Guías y motivos" className="px-5 py-4"><ul className="space-y-3">{reasons.map(reason => <li key={reason.guide}><span className="inline-block rounded-md bg-brand-blue/10 px-2 py-1 text-xs font-semibold text-brand-blue">{reason.guide}</span><p className="mt-1 text-sm text-brand-gray">{reason.detail}</p></li>)}</ul></td>
        {/* No existen registros de canalización todavía; sustituir por el estado persistido al integrar el flujo. */}
        <td data-label="Estatus" className="px-5 py-4 align-top"><span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Pendiente</span></td>
      </tr>)}</tbody>
    </table> : <p className="p-6 text-sm text-brand-muted">No hay empleados que requieran seguimiento con los resultados y filtros de este año.</p>}
  </section>;
}
