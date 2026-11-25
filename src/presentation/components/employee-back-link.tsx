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
  // Parsear la ruta permite conservar el año sin aceptar destinos externos.
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  const origin = new URL("https://internal.invalid");
  const target = new URL(returnTo, origin);
  if (target.origin !== origin.origin) return fallback;
  const allowedPath = company ? ["/empresa", "/empresa/nom-035"].includes(target.pathname) : /^\/admin\/empresas\/[a-fA-F0-9-]+$/.test(target.pathname);
  const dashboardView = target.searchParams.get("dashboardView");
  const year = target.searchParams.get("nomYear");
  const valid = allowedPath && (company || target.searchParams.get("tab") === "dashboard")
    && ["general", "clinical", "psychosocial2", "psychosocial3", "demographics", "guia4", "referrals", "reports", "forms"].includes(dashboardView ?? "")
    && (!year || /^(20\d{2}|2100)$/.test(year));
  const employees = !company && allowedPath && target.searchParams.get("tab") === "empleados";
  if (!valid && !employees) return fallback;
  return <Link href={returnTo} className="text-sm font-semibold text-brand-blue hover:underline">← {employees ? "Volver a empleados" : "Volver al dashboard"}</Link>;
}
