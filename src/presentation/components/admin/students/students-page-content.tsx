"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentListItem } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  createStudent,
  listStudents,
  StudentsApiError,
  updateStudentStatus,
} from "@/infrastructure/http/students-api";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CreateStudentForm } from "@/presentation/components/admin/students/create-student-form";
import { StudentsTable } from "@/presentation/components/admin/students/students-table";

type FilterValue = "all" | "active" | "inactive";
const PAGE_SIZE = 10;

export function StudentsPageContent() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const loadStudents = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const active =
        filter === "all" ? undefined : filter === "active";
      const result = await listStudents(token, {
        search: debouncedSearch || undefined,
        active,
        page,
        limit: PAGE_SIZE,
      });
      setStudents(result.students);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof StudentsApiError ? err.message : "Error al cargar estudiantes");
    } finally {
      setIsLoading(false);
    }
  }, [filter, debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  async function handleToggleStatus(student: StudentListItem) {
    const token = authStorage.getToken();
    if (!token) return;

    try {
      await updateStudentStatus(token, student.id, !student.active);
      await loadStudents();
    } catch (err) {
      setError(err instanceof StudentsApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Estudiantes"
        description="Crea cuentas para quienes soliciten información y les darás acceso. Desde el detalle verás sus cursos inscritos."
        action={
          <button
            type="button"
            onClick={() => {
              setShowCreate(true);
              setCreatedCredentials(null);
            }}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
          >
            Nuevo estudiante
          </button>
        }
      />

      {createdCredentials && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Estudiante creado. Credenciales:</p>
          <p className="mt-2 text-sm text-emerald-900">
            Correo: <strong>{createdCredentials.email}</strong>
          </p>
          <p className="text-sm text-emerald-900">
            Contraseña: <strong>{createdCredentials.password}</strong>
          </p>
        </div>
      )}

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nuevo estudiante</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Crea la cuenta y comparte las credenciales con el alumno.
          </p>
          <div className="mt-6">
            <CreateStudentForm
              onCancel={() => setShowCreate(false)}
              onSubmit={async (input) => {
                const token = authStorage.getToken();
                if (!token) return;
                await createStudent(token, input);
                setCreatedCredentials({ email: input.email, password: input.password });
                setShowCreate(false);
                setPage(1);
                await loadStudents();
              }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-col gap-4 border-b border-brand-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue sm:w-72"
          />
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  filter === value
                    ? "bg-brand-blue text-white"
                    : "bg-brand-light text-brand-gray"
                }`}
              >
                {value === "all" ? "Todos" : value === "active" ? "Activos" : "Inactivos"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="border-b border-brand-line px-6 py-3 text-sm text-red-600">{error}</div>
        )}

        <StudentsTable
          students={students}
          isLoading={isLoading}
          onToggleStatus={(student) => void handleToggleStatus(student)}
        />

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
