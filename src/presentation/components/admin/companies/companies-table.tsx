import Link from "next/link";
import type { CompanyListItem } from "@/core/domain/companies/types";
import { Tooltip } from "@/presentation/components/ui/tooltip";

interface CompaniesTableProps {
  companies: CompanyListItem[];
  isLoading: boolean;
}

function ViewIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function CompaniesTable({ companies, isLoading }: CompaniesTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-brand-muted">Cargando empresas...</div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-brand-muted">
        No hay empresas registradas. Crea la primera para asociarla a estudiantes.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-line bg-brand-light/50 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">RFC</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Trabajadores</th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">Patrón / representante</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-brand-light/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/empresas/${company.id}`} className="group block min-w-0">
                    <span className="font-medium text-brand-gray group-hover:text-brand-blue">
                      {company.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-muted lg:hidden">
                      {company.employerRepresentative || "Sin representante"}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-muted">{company.rfc || "—"}</td>
                <td className="hidden px-4 py-3 text-brand-muted lg:table-cell">
                  {company.studentsCount}
                </td>
                <td className="hidden max-w-[220px] truncate px-4 py-3 text-brand-muted xl:table-cell">
                  {company.employerRepresentative || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Tooltip label="Ver detalle de la empresa">
                    <Link
                      href={`/admin/empresas/${company.id}`}
                      aria-label="Ver detalle de la empresa"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-blue transition-colors hover:bg-brand-blue/5"
                    >
                      <ViewIcon />
                    </Link>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-brand-line md:hidden">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/admin/empresas/${company.id}`}
            className="block px-4 py-4 hover:bg-brand-light/40"
          >
            <p className="font-medium text-brand-gray">{company.name}</p>
            <p className="mt-1 text-xs text-brand-muted">
              RFC: {company.rfc || "—"} · {company.studentsCount} trabajador
              {company.studentsCount === 1 ? "" : "es"} vinculado
              {company.studentsCount === 1 ? "" : "s"}
            </p>
            {company.employerRepresentative && (
              <p className="mt-1 text-xs text-brand-muted">{company.employerRepresentative}</p>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
