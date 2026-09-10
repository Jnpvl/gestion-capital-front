"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CompanyDetail } from "@/core/domain/companies/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { CompaniesApiError, getCompany } from "@/infrastructure/http/companies-api";
import { showError } from "@/shared/lib/alerts";
import { CompanyEditForm } from "@/presentation/components/admin/companies/company-edit-form";

interface CompanyDetailContentProps {
  companyId: string;
}

export function CompanyDetailContent({ companyId }: CompanyDetailContentProps) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompany = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await getCompany(token, companyId);
      setCompany(result.company);
    } catch (err) {
      showError(err instanceof CompaniesApiError ? err.message : "Error al cargar la empresa");
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);

  if (isLoading) {
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
        <Link href="/admin/empresas" className="text-sm font-medium text-brand-blue hover:underline">
          ← Volver a empresas
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-gray">{company.name}</h1>
        <p className="mt-1 text-sm text-brand-muted">
          {company.studentsCount} trabajador{company.studentsCount === 1 ? "" : "es"} vinculado
          {company.studentsCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-line bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-brand-gray">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-brand-muted">RFC</dt>
              <dd className="font-medium text-brand-gray">{company.rfc || "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-muted">Trabajadores vinculados</dt>
              <dd className="font-medium text-brand-gray">{company.studentsCount}</dd>
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
              <dt className="text-brand-muted">Representante de trabajadores</dt>
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

        <div className="rounded-2xl border border-brand-line bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-brand-gray">Editar información</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Los datos se usan al vincular estudiantes con empresa y en constancias DC3.
          </p>
          <div className="mt-6">
            <CompanyEditForm company={company} onUpdated={setCompany} />
          </div>
        </div>
      </div>
    </div>
  );
}
