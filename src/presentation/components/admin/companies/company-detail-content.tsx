"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import { CompanyFormsTab } from "@/presentation/components/admin/companies/company-forms-tab";
import { CompanyEmployeesSection } from "@/presentation/components/admin/companies/company-employees-section";

const TABS = [
  { id: "general", label: "Datos generales" },
  { id: "empleados", label: "Empleados" },
  { id: "cursos", label: "Cursos" },
  { id: "formularios", label: "Formularios" },
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : "general";

  const selectTab = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "general") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const loadCompany = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await getCompany(token, companyId);
      setCompany(result.company);
    } catch (err) {
      showError(
        err instanceof CompaniesApiError
          ? err.message
          : "Error al cargar la empresa",
      );
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadCompany();
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

      {activeTab === "formularios" && (
        <div role="tabpanel" id="panel-formularios" aria-labelledby="tab-formularios">
          <CompanyFormsTab companyId={company.id} />
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
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-brand-line bg-white p-6">
            <h2 className="font-display text-lg font-bold text-brand-gray">
              Resumen
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-brand-muted">RFC</dt>
                <dd className="font-medium text-brand-gray">
                  {company.rfc || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Trabajadores vinculados</dt>
                <dd className="font-medium text-brand-gray">
                  {company.studentsCount}
                </dd>
                <p className="mt-1 text-xs text-brand-muted">
                  Se actualiza al vincular alumnos con esta empresa.
                </p>
              </div>
              <div>
                <dt className="text-brand-muted">Patrón o representante</dt>
                <dd className="font-medium text-brand-gray">
                  {company.employerRepresentative || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">
                  Representante de trabajadores
                </dt>
                <dd className="font-medium text-brand-gray">
                  {company.workersRepresentative || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Registrada</dt>
                <dd className="font-medium text-brand-gray">
                  {new Date(company.createdAt).toLocaleDateString("es-MX")}
                </dd>
              </div>
            </dl>
          </div>
          <CompanyAccessSection company={company} onUpdated={setCompany} />
          </div>

          <div className="rounded-2xl border border-brand-line bg-white p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-brand-gray">
              Editar información
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Los datos se usan al vincular estudiantes con empresa y en
              constancias DC3.
            </p>
            <div className="mt-6">
              <CompanyEditForm company={company} onUpdated={setCompany} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
