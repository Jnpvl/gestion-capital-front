"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { StudentListItem } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { listStudents, StudentsApiError } from "@/infrastructure/http/students-api";
import { showError } from "@/shared/lib/alerts";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";

const PAGE_SIZE = 10;

interface CompanyEmployeesSectionProps {
  companyId: string;
}

export function CompanyEmployeesSection({ companyId }: CompanyEmployeesSectionProps) {
  const [employees, setEmployees] = useState<StudentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await listStudents(token, {
        companyId,
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setEmployees(result.students);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(err instanceof StudentsApiError ? err.message : "Error al cargar empleados");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  return (
    <div className="rounded-2xl border border-brand-line bg-white">
      <div className="flex flex-col gap-4 border-b border-brand-line p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-gray">Empleados</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Alumnos vinculados a esta empresa.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo o CURP..."
          className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue lg:w-72"
        />
      </div>

      {isLoading ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">Cargando empleados...</div>
      ) : employees.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          {debouncedSearch
            ? "No hay empleados que coincidan con la búsqueda."
            : "Esta empresa aún no tiene empleados vinculados."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-line bg-brand-light/60">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Nombre
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    CURP
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Correo
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Puesto
                  </th>
                  <th className="w-28 px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {employees.map((employee) => (
                  <tr key={employee.id} className="transition-colors hover:bg-brand-light/50">
                    <td className="px-6 py-4 align-middle">
                      <Link
                        href={`/admin/alumnos/${employee.id}`}
                        className="font-medium text-brand-gray hover:text-brand-blue"
                      >
                        {employee.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-middle font-mono text-xs text-brand-muted">
                      {employee.curp || "—"}
                    </td>
                    <td className="px-4 py-4 align-middle text-brand-muted">{employee.email}</td>
                    <td className="px-4 py-4 align-middle text-brand-muted">
                      {employee.currentPosition || "—"}
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <StudentStatusBadge active={employee.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-brand-line md:hidden">
            {employees.map((employee) => (
              <article key={employee.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/alumnos/${employee.id}`}
                      className="font-medium text-brand-gray hover:text-brand-blue"
                    >
                      {employee.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-brand-muted">{employee.email}</p>
                    <p className="mt-0.5 font-mono text-xs text-brand-muted">
                      {employee.curp || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {employee.currentPosition || "—"}
                    </p>
                  </div>
                  <StudentStatusBadge active={employee.active} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
