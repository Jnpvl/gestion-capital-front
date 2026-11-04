"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function EmployeeBackLink({ company = false }: { company?: boolean }) {
  const fallback = <Link href={company ? "/empresa/empleados" : "/admin/alumnos"} className="text-sm font-semibold text-brand-blue hover:underline">← Volver a {company ? "empleados" : "alumnos"}</Link>;
  return <Suspense fallback={fallback}><OriginBackLink company={company} fallback={fallback} /></Suspense>;
}

function OriginBackLink({ company, fallback }: { company: boolean; fallback: React.ReactNode }) {
  const params = useSearchParams();
  const returnTo = params.get("returnTo");
  if (!returnTo) return fallback;
  // Solo destinos internos de dashboard del mismo portal.
  const valid = company
    ? /^\/empresa\?dashboardView=[a-zA-Z0-9]+$/.test(returnTo)
    : /^\/admin\/empresas\/[a-fA-F0-9-]+\?tab=dashboard&dashboardView=[a-zA-Z0-9]+$/.test(returnTo);
  const employees = !company && /^\/admin\/empresas\/[a-fA-F0-9-]+\?tab=empleados$/.test(returnTo);
  if (!valid && !employees) return fallback;
  return <Link href={returnTo} className="text-sm font-semibold text-brand-blue hover:underline">← {employees ? "Volver a empleados" : "Volver al dashboard"}</Link>;
}
