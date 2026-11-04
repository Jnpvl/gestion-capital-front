import Link from "next/link";

export function DashboardEmployeeLink({ studentId, name, readOnly = false, returnTo }: {
  studentId: string;
  name: string;
  readOnly?: boolean;
  returnTo: string;
}) {
  return <Link
    href={`${readOnly ? `/empresa/empleados/${studentId}` : `/admin/alumnos/${studentId}`}?returnTo=${encodeURIComponent(returnTo)}`}
    className="group inline-flex flex-col gap-1 rounded font-medium text-brand-gray hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
    aria-label={`Ver expediente de ${name}`}
  >
    <span className="group-hover:underline">{name}</span>
    <span className="text-xs font-semibold text-brand-blue">Ver expediente <span aria-hidden="true">→</span></span>
  </Link>;
}
