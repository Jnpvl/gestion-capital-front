"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CompanyDetail } from "@/core/domain/companies/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CompaniesApiError,
  getCompany,
} from "@/infrastructure/http/companies-api";
import { showError } from "@/shared/lib/alerts";
import { CompanyEditForm } from "@/presentation/components/admin/companies/company-edit-form";
import { CompanyAccessSection } from "@/presentation/components/admin/companies/company-access-section";
import { CompanyCoursesTab } from "@/presentation/components/admin/companies/company-courses-tab";
import { CompanyDashboardTab } from "@/presentation/components/admin/companies/company-dashboard-tab";
import { CompanyEmployeesSection } from "@/presentation/components/admin/companies/company-employees-section";

const TABS = [
  { id: "general", label: "Datos generales" },
  { id: "empleados", label: "Empleados" },
  { id: "cursos", label: "Cursos" },
  { id: "dashboard", label: "NOM-035" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return TABS.some((t) => t.id === value);
}

interface CompanyDetailContentProps {
  companyId: string;
}

export function CompanyDetailContent({ companyId }: CompanyDetailContentProps) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadVersion = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : "general";

  // Enlaces antiguos ?tab=formularios → NOM-035 / Formularios asignados
  useEffect(() => {
    if (tabParam !== "formularios") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "dashboard");
    params.set("dashboardView", "forms");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [tabParam, searchParams, pathname, router]);

  const selectTab = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "general") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const loadCompany = useCallback(async () => {
    const version = ++loadVersion.current;
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await getCompany(token, companyId);
      if (version !== loadVersion.current) return;
      setCompany(result.company);
    } catch (err) {
      if (version !== loadVersion.current) return;
      showError(
        err instanceof CompaniesApiError
          ? err.message
          : "Error al cargar la empresa",
      );
      setCompany(null);
    } finally {
      if (version === loadVersion.current) setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    let cancelled = false;
    const counter = loadVersion;
    void Promise.resolve().then(() => { if (!cancelled) void loadCompany(); });
    return () => { cancelled = true; counter.current++; };
  }, [loadCompany]);

  if (isLoading && !company) {
    return <div className="text-sm text-brand-muted">Cargando empresa...</div>;
  }

  if (!company) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No se encontró la empresa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/empresas"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← Volver a empresas
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-gray">
          {company.name}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          {company.studentsCount} trabajador
          {company.studentsCount === 1 ? "" : "es"} vinculado
          {company.studentsCount === 1 ? "" : "s"}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Secciones de la empresa"
        className="flex gap-1 overflow-x-auto border-b border-brand-line"
      >
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => selectTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                selected
                  ? "border-brand-black text-brand-gray"
                  : "border-transparent text-brand-muted hover:text-brand-gray"
              }`}
            >
              {tab.label}
              {tab.id === "empleados" && (
                <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-muted">
                  {company.studentsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "empleados" && (
        <div
          role="tabpanel"
          id="panel-empleados"
          aria-labelledby="tab-empleados"
        >
          <CompanyEmployeesSection
            company={company}
            onEmployeeCreated={() => void loadCompany()}
          />
        </div>
      )}

      {activeTab === "cursos" && (
        <div role="tabpanel" id="panel-cursos" aria-labelledby="tab-cursos">
          <CompanyCoursesTab
            companyId={company.id}
            companyRfc={company.rfc}
            employeesCount={company.studentsCount}
          />
        </div>
      )}

      {activeTab === "dashboard" && (
        <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard">
          <CompanyDashboardTab companyId={company.id} />
        </div>
      )}

      {activeTab === "general" && (
        <div
          role="tabpanel"
          id="panel-general"
          aria-labelledby="tab-general"
          className="space-y-6"
        >
          <div className="rounded-2xl border border-brand-line bg-white p-4 sm:p-6">
            <CompanyEditForm key={company.id} company={company} onUpdated={setCompany} />
          </div>
          <CompanyAccessSection company={company} onUpdated={setCompany} />
        </div>
      )}
    </div>
  );
}
