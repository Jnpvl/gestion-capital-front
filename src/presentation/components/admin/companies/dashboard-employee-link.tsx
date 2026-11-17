import Link from "next/link";

export function DashboardEmployeeLink({ studentId, name, readOnly = false, returnTo }: {
  studentId: string;
  name: string;
  readOnly?: boolean;
  returnTo: string;
}) {
  const origin = new URL(returnTo, "https://internal.invalid");
  const guide = ({ clinical: "nom035_guia1", psychosocial2: "nom035_guia2", psychosocial3: "nom035_guia3", demographics: "nom035_guia5" } as Record<string, string>)[origin.searchParams.get("dashboardView") ?? ""];
  const params = new URLSearchParams({ returnTo, section: "forms" });
  const year = origin.searchParams.get("nomYear");
  if (year && /^(20\d{2}|2100)$/.test(year)) params.set("nomYear", year);
  if (guide) params.set("guide", guide);
  return <Link
    href={`${readOnly ? `/empresa/empleados/${studentId}` : `/admin/alumnos/${studentId}`}?${params.toString()}`}
    className="group inline-flex flex-col gap-1 rounded font-medium text-brand-gray hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
    aria-label={`Ver expediente de ${name}`}
  >
    <span className="group-hover:underline">{name}</span>
    <span className="text-xs font-semibold text-brand-blue">Ver expediente <span aria-hidden="true">→</span></span>
  </Link>;
}
