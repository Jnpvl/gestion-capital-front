"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import { getCompanyEmployeesFormsSummary } from "@/infrastructure/http/forms-api";
import {
  getPortalEmployeesFormsSummary,
  listPortalEmployees,
} from "@/infrastructure/http/company-portal-api";
import type { EmployeeFormState, FormKey } from "@/core/domain/forms/types";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";

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
  const [formsByStudent, setFormsByStudent] = useState<Record<string, EmployeeFormState[]>>({});
  const [preview, setPreview] = useState<{
    studentId: string;
    name: string;
    formKey: FormKey;
  } | null>(null);

  const loadEmployees = useCallback(async () => {
    const token = readOnly ? null : authStorage.getToken();
    if (!readOnly && !token) return;

    setIsLoading(true);

    try {
      const params = { search: debouncedSearch || undefined, page, limit: PAGE_SIZE };
      const result = readOnly
        ? await listPortalEmployees(params)
        : await listStudents(token as string, { companyId, ...params });
      setEmployees(result.students);
      const ids = result.students.map((s) => s.id);
      if (ids.length === 0) {
        setFormsByStudent({});
      } else (readOnly ? getPortalEmployeesFormsSummary(ids) : getCompanyEmployeesFormsSummary(companyId, ids))
        .then((r) => setFormsByStudent(r.employees))
        .catch(() => setFormsByStudent({}));
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(
        err instanceof StudentsApiError || readOnly
          ? (err as Error).message
          : "Error al cargar empleados",
      );
    } finally {
      setIsLoading(false);
    }
  }, [companyId, debouncedSearch, page, readOnly]);

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
    void loadEmployees();
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o CURP..."
            className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue lg:w-72"
          />
          {!readOnly && (
          <>
          <button
            type="button"
            disabled={sendingAccess || total === 0}
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
                : "Enviar accesos a todos"}
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
          {!allSelected && pageAllChecked && total > pageIds.length && !debouncedSearch && (
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
                      <EmployeeName id={employee.id} name={employee.name} readOnly={readOnly} />
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
                    <EmployeeName id={employee.id} name={employee.name} readOnly={readOnly} />
                    <p className="mt-0.5 truncate text-xs text-brand-muted">
                      {employee.email}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-brand-muted">
                      {employee.curp || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {employee.currentPosition || "—"}
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
                  setPage(1);
                  await loadEmployees();
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
          formKey={preview.formKey}
          readOnly={readOnly}
          onClose={() => setPreview(null)}
          onSaved={() => {
            const ids = employees.map((e) => e.id);
            getCompanyEmployeesFormsSummary(companyId, ids)
              .then((r) => setFormsByStudent(r.employees))
              .catch(() => undefined);
          }}
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
          setPage(1);
          void loadEmployees();
          onEmployeeCreated?.();
        }}
      />
      )}
    </div>
  );
}

function EmployeeName({ id, name, readOnly }: { id: string; name: string; readOnly: boolean }) {
  if (readOnly) return <span className="font-medium text-brand-gray">{name}</span>;
  return (
    <Link href={`/admin/alumnos/${id}`} className="font-medium text-brand-gray hover:text-brand-blue">
      {name}
    </Link>
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
