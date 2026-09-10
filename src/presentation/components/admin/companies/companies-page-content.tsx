"use client";

import { useCallback, useEffect, useState } from "react";
import type { CompanyListItem } from "@/core/domain/companies/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CompaniesApiError,
  createCompany,
  listCompanies,
} from "@/infrastructure/http/companies-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CompaniesTable } from "@/presentation/components/admin/companies/companies-table";
import { CreateCompanyForm } from "@/presentation/components/admin/companies/create-company-form";

const PAGE_SIZE = 10;

export function CompaniesPageContent() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadCompanies = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await listCompanies(token, {
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setCompanies(result.companies);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(err instanceof CompaniesApiError ? err.message : "Error al cargar empresas");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  return (
    <>
      <AdminPageHeader
        title="Empresas"
        description="Registra la información de empresas para vincularla con estudiantes y constancias DC3."
        action={
          !showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
            >
              Nueva empresa
            </button>
          ) : undefined
        }
      />

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nueva empresa</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Completa los datos del empleador según el expediente STPS.
          </p>
          <div className="mt-6">
            <CreateCompanyForm
              onCancel={() => setShowCreate(false)}
              onSubmit={async (input) => {
                const token = authStorage.getToken();
                if (!token) return;
                await createCompany(token, input);
                setShowCreate(false);
                setPage(1);
                await loadCompanies();
                showSuccess("Empresa creada correctamente");
              }}
            />
          </div>
        </div>
      )}

      {!showCreate && (
        <div className="rounded-2xl border border-brand-line bg-white">
          <div className="border-b border-brand-line p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o RFC..."
              className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue sm:w-72"
            />
          </div>

          <CompaniesTable companies={companies} isLoading={isLoading} />

          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}
