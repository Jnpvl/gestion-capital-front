import type { CompanyDashboardResponse } from "@/core/domain/forms/types";
import { getReferralReasons } from "@/shared/lib/referral-reasons";
import { DashboardEmployeeLink } from "./dashboard-employee-link";

const STATUS_STYLE: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-900",
  Canalizado: "bg-sky-50 text-sky-900",
  "En atención": "bg-sky-50 text-sky-900",
  Alta: "bg-emerald-50 text-emerald-900",
  Seguimiento: "bg-violet-50 text-violet-900",
};

function referralStatusLabel(status: string | null | undefined) {
  return status?.trim() || "Pendiente";
}

export function CompanyDashboardReferrals({ data, readOnly, returnTo }: {
  data: CompanyDashboardResponse; readOnly: boolean; returnTo: string;
}) {
  const rows = data.employees
    .map((employee) => {
      const reasons = getReferralReasons(employee, data).map((reason) => ({
        guide: reason.title,
        detail: reason.descriptions.join(" · "),
      }));
      return reasons.length
        ? {
            employee,
            reasons,
            status: referralStatusLabel(employee.referralStatus),
          }
        : null;
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => a.employee.employeeName.localeCompare(b.employee.employeeName, "es"));

  return <section className="rounded-2xl border border-brand-line bg-white">
    <header className="border-b border-brand-line p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Canalizaciones · {data.evaluationYear}</h2>
      <p className="mt-2 text-sm text-brand-muted">{rows.length} empleados requieren seguimiento</p>
    </header>
    {rows.length ? <table className="responsive-table text-left text-sm">
      <thead className="bg-brand-light text-brand-muted"><tr><th className="px-5 py-3">Empleado</th><th className="px-5 py-3">Guías y motivos de seguimiento</th><th className="px-5 py-3">Estatus</th></tr></thead>
      <tbody className="divide-y divide-brand-line">{rows.map(({ employee, reasons, status }) => <tr key={employee.studentId}>
        <td data-label="Empleado" className="px-5 py-4 align-top"><DashboardEmployeeLink studentId={employee.studentId} name={employee.employeeName} readOnly={readOnly} returnTo={returnTo} /></td>
        <td data-label="Guías y motivos" className="px-5 py-4"><ul className="space-y-3">{reasons.map(reason => <li key={reason.guide}><span className="inline-block rounded-md bg-brand-blue/10 px-2 py-1 text-xs font-semibold text-brand-blue">{reason.guide}</span><p className="mt-1 text-sm text-brand-gray">{reason.detail}</p></li>)}</ul></td>
        <td data-label="Estatus" className="px-5 py-4 align-top">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-brand-light text-brand-gray"}`}>
            {status}
          </span>
        </td>
      </tr>)}</tbody>
    </table> : <p className="p-6 text-sm text-brand-muted">No hay empleados que requieran seguimiento con los resultados y filtros de este año.</p>}
  </section>;
}
