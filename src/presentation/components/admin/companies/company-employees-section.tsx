"use client";

import Link from "next/link";
import { EmployeeRecordNumber } from "./employee-record-number";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CompanyDetail } from "@/core/domain/companies/types";
import type { StudentListItem } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  createStudent,
  listStudents,
  StudentsApiError,
} from "@/infrastructure/http/students-api";
import {
  confirmSendAccess,
  showCredentialsCreated,
  showError,
  showSendAccessSummary,
} from "@/shared/lib/alerts";
import {
  previewCompanyEmployeesAccess,
  sendCompanyEmployeesAccess,
} from "@/infrastructure/http/companies-api";
import { CreateStudentForm } from "@/presentation/components/admin/students/create-student-form";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CompanyEmployeesImportModal } from "@/presentation/components/admin/companies/company-employees-import-modal";
import { EmployeeFormPreviewModal } from "@/presentation/components/admin/companies/employee-form-preview-modal";
import { EmployeeFormsIcons } from "@/presentation/components/admin/companies/employee-forms-icons";
import { getCompanyEmployeesFormsSummary, getCompanyFormResults } from "@/infrastructure/http/forms-api";
import {
  getPortalEmployeesFormsSummary,
  getPortalFormResults,
  listPortalEmployees,
} from "@/infrastructure/http/company-portal-api";
import type { CompanyDashboardResponse, EmployeeFormState, FormKey } from "@/core/domain/forms/types";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";

import { CompanyDashboardDemographicFilters } from "./company-dashboard-demographic-filters";
import { resolveDemographicAllowedIds } from "@/shared/lib/dashboard-demographic-filters";

const PAGE_SIZE = 10;

interface CompanyEmployeesSectionProps {
  company: Pick<CompanyDetail, "id" | "name" | "rfc">;
  onEmployeeCreated?: () => void;
  /** Portal de empresa: solo buscar y ver formularios (sin carga, alta, edición ni links al admin). */
  readOnly?: boolean;
}

export function CompanyEmployeesSection({
  company,
  onEmployeeCreated,
  readOnly = false,
}: CompanyEmployeesSectionProps) {
  const companyId = company.id;
  const currentYear = new Date().getFullYear();
  const [evaluationYear, setEvaluationYear] = useState(currentYear);
  const [evaluationYears, setEvaluationYears] = useState<number[]>([]);
  const [demographicData, setDemographicData] = useState<CompanyDashboardResponse | null>(null);
  const [departamento, setDepartamento] = useState("");
  const [puesto, setPuesto] = useState("");
  const requestVersion = useRef(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const filteredListCache = useRef<{ key: string; students: StudentListItem[] } | null>(null);
  const refreshData = () => {
    filteredListCache.current = null;
    setDemographicData(null);
    setRefreshVersion(value => value + 1);
  };
  const hasDemographicFilter = Boolean(departamento || puesto);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [employees, setEmployees] = useState<StudentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Selección para "Enviar accesos" (solo admin). allSelected = todos los de la empresa.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [sendingAccess, setSendingAccess] = useState(false);
  const changeDepartamento = useCallback((value: string) => {
    setDepartamento(value); setPage(1); setSelected(new Set()); setAllSelected(false);
  }, []);
  const changePuesto = useCallback((value: string) => {
    setPuesto(value); setPage(1); setSelected(new Set()); setAllSelected(false);
  }, []);
  const [formsByStudent, setFormsByStudent] = useState<Record<string, EmployeeFormState[]>>({});
  const [preview, setPreview] = useState<{
    studentId: string;
    name: string;
    formKey: FormKey;
  } | null>(null);

  const loadEmployees = useCallback(async () => {
    if (!demographicData) return;
    const token = readOnly ? null : authStorage.getToken();
    if (!readOnly && !token) return;

    const version = ++requestVersion.current;
    setIsLoading(true);

    try {
      const fetchPage = (requestedPage: number, limit: number) => {
        const params = { search: debouncedSearch || undefined, page: requestedPage, limit };
        return readOnly ? listPortalEmployees(params) : listStudents(token as string, { companyId, ...params });
      };
      const cacheKey = JSON.stringify([companyId, readOnly, token, debouncedSearch, refreshVersion]);
      const cached = hasDemographicFilter && filteredListCache.current?.key === cacheKey ? filteredListCache.current.students : null;
      let result = cached ? { students: cached, total: cached.length, totalPages: 1, page: 1, limit: 50 } : await fetchPage(hasDemographicFilter ? 1 : page, hasDemographicFilter ? 50 : PAGE_SIZE);
      if (hasDemographicFilter) {
        if (!demographicData) return;
        const allowed = resolveDemographicAllowedIds(demographicData.demographics, demographicData.employees, departamento, puesto);
        const all = [...result.students];
        for (let next = 2; next <= result.totalPages; next++) {
          if (version !== requestVersion.current) return;
          all.push(...(await fetchPage(next, 50)).students);
        }
        if (version !== requestVersion.current) return;
        filteredListCache.current = { key: cacheKey, students: all };
        const matching = all.filter(employee => allowed?.has(employee.id));
        result = { ...result, students: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: matching.length, totalPages: Math.max(1, Math.ceil(matching.length / PAGE_SIZE)) };
      }
      if (version !== requestVersion.current) return;
      setEmployees(result.students);
      const ids = result.students.map((s) => s.id);
      if (ids.length === 0) {
        setFormsByStudent({});
      } else {
        setFormsByStudent({});
        const summary = await (readOnly ? getPortalEmployeesFormsSummary(ids, evaluationYear) : getCompanyEmployeesFormsSummary(companyId, ids, evaluationYear));
        if (version !== requestVersion.current) return;
        setFormsByStudent(summary.employees);
      }
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      if (version !== requestVersion.current) return;
      showError(
        err instanceof StudentsApiError || readOnly
          ? (err as Error).message
          : "Error al cargar empleados",
      );
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [companyId, debouncedSearch, page, readOnly, evaluationYear, departamento, puesto, demographicData, hasDemographicFilter, refreshVersion]);

  useEffect(() => {
    let cancelled = false;
    (readOnly ? getPortalFormResults(evaluationYear) : getCompanyFormResults(companyId, evaluationYear))
      .then(result => { if (!cancelled) { setDemographicData(result); setEvaluationYears(result.evaluationYears ?? []); } })
      .catch(() => {
        if (cancelled) return;
        setDepartamento("");
        setPuesto("");
        setDemographicData({ evaluationYear, evaluationYears: [], assignedFormKeys: [], employees: [] });
        showError("No se pudieron cargar los filtros de Guía V. Puedes seguir consultando empleados.");
      });
    return () => { cancelled = true; };
  }, [companyId, readOnly, evaluationYear, refreshVersion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setSelected(new Set());
      setAllSelected(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const counter = requestVersion;
    void Promise.resolve().then(() => { if (!cancelled) void loadEmployees(); });
    return () => { cancelled = true; counter.current++; };
  }, [loadEmployees]);

  useEffect(() => {
    if (!showCreate) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showCreate]);

  const showSelect = !readOnly;
  const pageIds = employees.map((e) => e.id);
  const pageAllChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const togglePage = () => {
    setAllSelected(false);
    setSelected((cur) => {
      const n = new Set(cur);
      if (pageAllChecked) pageIds.forEach((id) => n.delete(id));
      else pageIds.forEach((id) => n.add(id));
      return n;
    });
  };
  const toggleOne = (id: string) => {
    setAllSelected(false);
    setSelected((cur) => {
      const n = new Set(cur);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const clearSelection = () => {
    setSelected(new Set());
    setAllSelected(false);
  };

  async function sendAccess(target: { all: true } | { studentIds: string[] }) {
    const token = authStorage.getToken();
    if (!token || sendingAccess) return;
    setSendingAccess(true);
    try {
      const preview = await previewCompanyEmployeesAccess(token, companyId, target);
      if (preview.total === 0) {
        showError("No hay empleados para enviar");
        return;
      }
      const { confirmed, activateInactive } = await confirmSendAccess(preview);
      if (!confirmed) return;
      const result = await sendCompanyEmployeesAccess(token, companyId, { ...target, activateInactive });
      clearSelection();
      filteredListCache.current = null;
      await loadEmployees();
      await showSendAccessSummary(result);
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudieron enviar los accesos");
    } finally {
      setSendingAccess(false);
    }
  }
  const selectionCount = allSelected ? total : selected.size;

  return (
    <div className="rounded-2xl border border-brand-line bg-white">
      <div className="flex flex-col gap-4 border-b border-brand-line p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-gray">
            Empleados
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {readOnly ? "Trabajadores de tu empresa." : "Alumnos vinculados a esta empresa."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!readOnly && (
          <>
          <button
            type="button"
            disabled={isLoading || sendingAccess || total === 0 || (hasDemographicFilter && selected.size === 0)}
            onClick={() =>
              void sendAccess(
                allSelected || selected.size === 0
                  ? { all: true }
                  : { studentIds: Array.from(selected) },
              )
            }
            title="Genera una contraseña nueva y la envía por correo"
            className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-brand-gray hover:bg-brand-light disabled:opacity-50"
          >
            {sendingAccess
              ? "Enviando..."
              : selectionCount > 0 && !allSelected
                ? `Enviar accesos (${selectionCount})`
                : hasDemographicFilter ? "Selecciona empleados" : "Enviar accesos a todos"}
          </button>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-brand-gray hover:bg-brand-light"
          >
            Carga masiva
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:bg-brand-gray"
          >
            Agregar empleado
          </button>
          </>
          )}
        </div>
      </div>

      <div className="space-y-4 border-b border-brand-line bg-brand-light/30 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Buscar y filtrar empleados</h3>
            <p className="mt-1 text-xs text-brand-muted">El año aplica a los formularios y a los datos de departamento y puesto de la Guía V.</p>
          </div>
          {(search || hasDemographicFilter) && <button type="button"
            onClick={() => { setSearch(""); setDebouncedSearch(""); changeDepartamento(""); changePuesto(""); }}
            className="text-sm font-semibold text-brand-blue hover:underline">
            Limpiar filtros
          </button>}
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Año de evaluación</span>
          <select
            aria-label="Año de evaluación"
            value={evaluationYear}
            disabled={isLoading}
            onChange={(event) => {
              setPreview(null);
              setDemographicData(null);
              changeDepartamento("");
              changePuesto("");
              setEvaluationYear(Number(event.target.value));
            }}
            className="block w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-gray"
          >
            {Array.from(
              new Set([
                ...evaluationYears,
                evaluationYear,
                currentYear - 1,
                currentYear,
                currentYear + 1,
              ]),
            )
              .sort((a, b) => b - a)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>

          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Buscar empleado</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, correo, CURP o expediente (UUID)"
              className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue" />
          </label>
        </div>
        {demographicData && <CompanyDashboardDemographicFilters
          embedded demographics={demographicData.demographics} employees={demographicData.employees}
          departamento={departamento} puesto={puesto}
          onDepartamentoChange={changeDepartamento} onPuestoChange={changePuesto}
        />}
        <p role="status" className="text-xs text-brand-muted">
          {isLoading ? "Buscando empleados…" : `${total} empleado${total === 1 ? "" : "s"}${search || hasDemographicFilter ? " encontrados" : ""}`} · Formularios {evaluationYear}
        </p>
      </div>

      {showSelect && (pageAllChecked || allSelected || selected.size > 0) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-brand-line bg-brand-light/60 px-6 py-2.5 text-sm text-brand-gray">
          {allSelected ? (
            <span>
              Seleccionados los <strong>{total}</strong> empleados
              {debouncedSearch ? " que coinciden con la búsqueda" : " de la empresa"}.
            </span>
          ) : (
            <span>
              {selected.size} seleccionado{selected.size === 1 ? "" : "s"}.
            </span>
          )}
          {!allSelected && pageAllChecked && total > pageIds.length && !debouncedSearch && !hasDemographicFilter && (
            <button
              type="button"
              onClick={() => setAllSelected(true)}
              className="font-semibold text-brand-blue hover:underline"
            >
              Seleccionar los {total} empleados de la empresa
            </button>
          )}
          <button type="button" onClick={clearSelection} className="text-brand-muted hover:underline">
            Limpiar selección
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          Cargando empleados...
        </div>
      ) : employees.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          {debouncedSearch || hasDemographicFilter
            ? "No hay empleados que coincidan con la búsqueda y los filtros."
            : "Esta empresa aún no tiene empleados vinculados."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-line bg-brand-light/60">
                  {showSelect && (
                    <th className="w-10 py-3.5 pl-6">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar empleados de esta página"
                        checked={allSelected || pageAllChecked}
                        onChange={togglePage}
                        className="h-4 w-4 accent-brand-black"
                      />
                    </th>
                  )}
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
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Ocupación STPS
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Formularios
                  </th>
                  {!readOnly && (
                    <th className="w-28 px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Estado
                    </th>
                  )}
                  {showSelect && (
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Accesos
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition-colors hover:bg-brand-light/50"
                  >
                    {showSelect && (
                      <td className="py-4 pl-6 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar a ${employee.name}`}
                          checked={allSelected || selected.has(employee.id)}
                          onChange={() => toggleOne(employee.id)}
                          className="h-4 w-4 accent-brand-black"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 align-middle">
                      <EmployeeName id={employee.id} name={employee.name} readOnly={readOnly} companyId={company.id} />
                    </td>
                    <td className="px-4 py-4 align-middle font-mono text-xs text-brand-muted">
                      {employee.curp || "—"}
                    </td>
                    <td className="px-4 py-4 align-middle text-brand-muted">
                      {employee.email}
                    </td>
                    <td className="px-4 py-4 align-middle text-brand-muted">
                      {employee.currentPosition || "—"}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {employee.stpsOccupationCode ? (
                        <div>
                          <p className="text-brand-gray">{employee.stpsOccupationName || employee.stpsOccupationCode}</p>
                          {employee.stpsOccupationName && (
                            <p className="mt-0.5 font-mono text-xs text-brand-muted">{employee.stpsOccupationCode}</p>
                          )}
                        </div>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Sin STPS
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <EmployeeFormsIcons
                        forms={formsByStudent[employee.id]}
                        readOnly={readOnly}
                        onOpen={(formKey) =>
                          setPreview({ studentId: employee.id, name: employee.name, formKey })
                        }
                      />
                    </td>
                    {!readOnly && (
                      <td className="px-6 py-4 text-center align-middle">
                        <StudentStatusBadge active={employee.active} />
                      </td>
                    )}
                    {showSelect && (
                      <td className="px-6 py-4 align-middle">
                        <SendAccessCell
                          sentAt={employee.accessEmailSentAt}
                          disabled={sendingAccess}
                          onSend={() => void sendAccess({ studentIds: [employee.id] })}
                        />
                      </td>
                    )}
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
                    <EmployeeName id={employee.id} name={employee.name} readOnly={readOnly} companyId={company.id} />
                    <p className="mt-0.5 truncate text-xs text-brand-muted">
                      {employee.email}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-brand-muted">
                      {employee.curp || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {employee.currentPosition || "—"}
                    </p>
                    <p className="mt-1 text-xs">
                      {employee.stpsOccupationCode ? (
                        <span className="text-brand-muted">
                          STPS: {employee.stpsOccupationName || employee.stpsOccupationCode}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                          Sin STPS
                        </span>
                      )}
                    </p>
                    <div className="mt-2">
                      <EmployeeFormsIcons
                        forms={formsByStudent[employee.id]}
                        readOnly={readOnly}
                        onOpen={(formKey) =>
                          setPreview({ studentId: employee.id, name: employee.name, formKey })
                        }
                      />
                    </div>
                  </div>
                  {!readOnly && <StudentStatusBadge active={employee.active} />}
                </div>
                {showSelect && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-xs text-brand-muted">
                      <input
                        type="checkbox"
                        checked={allSelected || selected.has(employee.id)}
                        onChange={() => toggleOne(employee.id)}
                        className="h-4 w-4 accent-brand-black"
                      />
                      Seleccionar
                    </label>
                    <SendAccessCell
                      sentAt={employee.accessEmailSentAt}
                      disabled={sendingAccess}
                      onSend={() => void sendAccess({ studentIds: [employee.id] })}
                    />
                  </div>
                )}
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
      {showCreate && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:py-10">
          {/* Fondo: no cierra el modal (solo los botones de cerrar). */}
          <div aria-hidden className="fixed inset-0 bg-brand-gray/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-employee-title"
            className="relative w-full max-w-3xl rounded-2xl border border-brand-line bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="new-employee-title"
                  className="font-display text-lg font-bold text-brand-gray"
                >
                  Nuevo empleado
                </h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Se registra como trabajador vinculado a {company.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Cerrar"
                className="rounded-lg px-2 py-1 text-lg leading-none text-brand-muted hover:bg-brand-light"
              >
                ×
              </button>
            </div>
            <div className="mt-6">
              <CreateStudentForm
                fixedCompany={{
                  id: company.id,
                  name: company.name,
                  rfc: company.rfc,
                }}
                submitLabel="Crear empleado"
                onCancel={() => setShowCreate(false)}
                onSubmit={async (input) => {
                  const token = authStorage.getToken();
                  if (!token) return;
                  await createStudent(token, input);
                  setShowCreate(false);
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                  refreshData();
                  onEmployeeCreated?.();
                  await showCredentialsCreated({
                    title: "Empleado creado",
                    email: input.email,
                    password: input.password,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
      {preview && (
        <EmployeeFormPreviewModal
          companyId={companyId}
          studentId={preview.studentId}
          employeeName={preview.name}
          evaluationYear={evaluationYear}
          formKey={preview.formKey}
          readOnly={readOnly}
          onClose={() => setPreview(null)}
          onSaved={refreshData}
        />
      )}
      {!readOnly && (
      <CompanyEmployeesImportModal
        open={showImport}
        companyId={company.id}
        companyName={company.name}
        onClose={() => setShowImport(false)}
        onImported={() => {
          setSearch("");
          setDebouncedSearch("");
          setPage(1);
          refreshData();
          onEmployeeCreated?.();
        }}
      />
      )}
    </div>
  );
}

function EmployeeName({ id, name, readOnly, companyId }: { id: string; name: string; readOnly: boolean; companyId: string }) {
  return (
    <div>
      <Link href={readOnly ? `/empresa/empleados/${id}` : `/admin/alumnos/${id}?returnTo=${encodeURIComponent(`/admin/empresas/${companyId}?tab=empleados`)}`} className="font-medium text-brand-gray hover:text-brand-blue">
        {name}
      </Link>
      <EmployeeRecordNumber id={id} />
      {readOnly && <Link href={`/empresa/empleados/${id}`} className="mt-1 inline-block text-xs font-semibold text-brand-blue hover:underline">Ver detalle →</Link>}
    </div>
  );
}

function SendAccessCell({
  sentAt,
  disabled,
  onSend,
}: {
  sentAt?: string | null;
  disabled: boolean;
  onSend: () => void;
}) {
  const when = sentAt
    ? new Date(sentAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
    : null;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        title={when ? `Último envío: ${when}` : "Aún no se han enviado accesos desde aquí"}
        className="whitespace-nowrap rounded-lg border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
      >
        Enviar accesos
      </button>
      <span className="text-[11px] text-brand-muted">
        {when ? `Enviado: ${new Date(sentAt as string).toLocaleDateString("es-MX")}` : "Sin envío"}
      </span>
    </div>
  );
}
