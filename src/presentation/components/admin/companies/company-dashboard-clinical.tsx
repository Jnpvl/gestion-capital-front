import { DashboardEmployeeLink } from "./dashboard-employee-link";
import { clinicalResultColor, clinicalResultText, type CompanyDashboardResponse } from "@/core/domain/forms/types";

const format = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });

export function CompanyDashboardClinical({ data, readOnly = false, returnTo }: { data: CompanyDashboardResponse; readOnly?: boolean; returnTo: string }) {
  const assigned = data.assignedFormKeys.includes("nom035_guia1");
  const evaluated = assigned ? data.employees.flatMap(employee => {
    const cell = employee.forms.nom035_guia1;
    const requires = cell?.result?.requiresClinicalAssessment;
    return cell?.status === "completed" && typeof requires === "boolean"
      ? [{ id: employee.studentId, name: employee.employeeName, requires }]
      : [];
  }) : [];
  const requires = evaluated.filter(e => e.requires).length;
  const remaining = data.employees.length - evaluated.length;
  const percent = (count: number, total: number) => total ? count / total * 100 : 0;
  const groups = [
    { label: "Requieren valoración clínica", count: requires, color: "#e11d48" },
    { label: "No requieren valoración clínica", count: evaluated.length - requires, color: "#059669" },
  ];

  return <section className="space-y-6" aria-label="Resultados de Guía I">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Guía I</p><h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">Valoración clínica</h2><p className="mt-2 text-sm text-brand-muted">Resultados del cuestionario de acontecimientos traumáticos severos de la última asignación. Solo se incluyen evaluaciones completas con resultado.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Evaluaciones con resultado", value: assigned ? `${evaluated.length} / ${data.employees.length}` : "—", note: `${format.format(percent(evaluated.length, data.employees.length))}% de los empleados` },
        { label: "Requieren valoración clínica", value: evaluated.length ? requires : "—", note: evaluated.length ? `${format.format(percent(requires, evaluated.length))}% de los evaluados` : "Sin resultados disponibles" },
        { label: "No requieren valoración clínica", value: evaluated.length ? evaluated.length - requires : "—", note: evaluated.length ? `${format.format(percent(evaluated.length - requires, evaluated.length))}% de los evaluados` : "Sin resultados disponibles" },
        { label: "Sin resultado disponible", value: assigned ? remaining : "—", note: assigned ? "Pendientes, parciales o sin resultado" : "Guía I sin asignar" },
      ].map((card, i) => <div key={card.label} className={`rounded-2xl border p-5 ${i === 0 ? "border-brand-blue bg-brand-blue text-white" : "border-brand-line bg-white text-brand-gray"}`}><p className="text-xs font-semibold">{card.label}</p><p className="mt-3 text-3xl font-bold tabular-nums">{card.value}</p><p className={`mt-2 text-xs ${i === 0 ? "text-white/75" : "text-brand-muted"}`}>{card.note}</p></div>)}
    </div>
    {!evaluated.length ? <div className="rounded-2xl border border-dashed border-brand-line bg-white p-10 text-center"><h3 className="font-semibold text-brand-gray">{assigned ? "Aún no hay resultados de Guía I" : "La Guía I no está asignada"}</h3><p className="mt-2 text-sm text-brand-muted">La distribución aparecerá cuando haya cuestionarios completos con resultado.</p></div> : <>
      <div className="grid gap-6 rounded-2xl border border-brand-line bg-white p-6 md:grid-cols-2">
        <div><h3 className="font-display font-bold text-brand-gray">Distribución de resultados</h3><p className="mt-2 text-sm text-brand-muted">Porcentaje sobre {evaluated.length} {evaluated.length === 1 ? "evaluación con resultado" : "evaluaciones con resultado"}. Los empleados pendientes no se cuentan en ninguno de los dos grupos.</p><div className="mt-6 space-y-5">{groups.map(group => <div key={group.label}><div className="mb-2 flex justify-between gap-4 text-sm"><span>{group.label}</span><strong className="shrink-0">{group.count} · {format.format(percent(group.count, evaluated.length))}%</strong></div><div className="h-3 overflow-hidden rounded-full bg-brand-light" aria-hidden="true"><div className="h-full rounded-full" style={{ width: `${percent(group.count, evaluated.length)}%`, background: group.color }} /></div></div>)}</div></div>
        <div className="flex items-center justify-center"><svg viewBox="0 0 240 240" className="w-full max-w-64" role="img" aria-label={`${requires} requieren valoración clínica y ${evaluated.length - requires} no la requieren`}><circle cx="120" cy="120" r="88" fill="none" stroke="#059669" strokeWidth="25" /><circle cx="120" cy="120" r="88" fill="none" stroke="#e11d48" strokeWidth="25" pathLength="100" strokeDasharray={`${percent(requires, evaluated.length)} 100`} transform="rotate(-90 120 120)" /><text x="120" y="118" textAnchor="middle" fontSize="36" fontWeight="700" fill="#2a2a2e">{evaluated.length}</text><text x="120" y="141" textAnchor="middle" fontSize="12" fill="#6b6b70">evaluados</text></svg></div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-brand-line bg-white"><div className="border-b border-brand-line p-6"><h3 className="font-display font-bold text-brand-gray">Detalle de Guía I</h3><p className="mt-1 text-sm text-brand-muted">Resultado por empleado evaluado.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-brand-light text-brand-muted"><tr><th className="px-6 py-3">Empleado</th><th className="px-6 py-3">Resultado</th></tr></thead><tbody className="divide-y divide-brand-line">{evaluated.map(employee => <tr key={employee.id}><td className="px-6 py-4 font-medium"><DashboardEmployeeLink studentId={employee.id} name={employee.name} readOnly={readOnly} returnTo={returnTo} /></td><td className="px-6 py-4"><span className="inline-block rounded-lg px-3 py-1 text-xs font-semibold" style={clinicalResultColor(employee.requires)}>{clinicalResultText(employee.requires)}</span></td></tr>)}</tbody></table></div></div>
    </>}
  </section>;
}
