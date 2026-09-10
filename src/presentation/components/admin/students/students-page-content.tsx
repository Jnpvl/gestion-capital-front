"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AlumnoType } from "@/core/domain/students/alumno-types";
import { ALUMNO_TYPE_OPTIONS } from "@/core/domain/students/alumno-types";
import type { StudentListItem } from "@/core/domain/students/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  createStudent,
  listStudents,
  StudentsApiError,
  updateStudentStatus,
} from "@/infrastructure/http/students-api";
import { confirmAction, showCredentialsCreated, showError, showSuccess } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CreateStudentForm } from "@/presentation/components/admin/students/create-student-form";
import { StudentsTable } from "@/presentation/components/admin/students/students-table";

type FilterValue = "all" | "active" | "inactive";
type TypeFilter = "all" | AlumnoType;
const PAGE_SIZE = 10;

export function StudentsPageContent() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadStudents = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const active = filter === "all" ? undefined : filter === "active";
      const result = await listStudents(token, {
        search: debouncedSearch || undefined,
        active,
        alumnoType: typeFilter === "all" ? undefined : typeFilter,
        page,
        limit: PAGE_SIZE,
      });
      setStudents(result.students);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(err instanceof StudentsApiError ? err.message : "Error al cargar alumnos");
    } finally {
      setIsLoading(false);
    }
  }, [filter, typeFilter, debouncedSearch, page]);

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

    const nextActive = !student.active;
    const confirmed = await confirmAction({
      title: nextActive ? "Activar alumno" : "Desactivar alumno",
      text: nextActive
        ? `¿Activar el acceso de ${student.name}?`
        : `¿Desactivar el acceso de ${student.name}?`,
      confirmText: nextActive ? "Sí, activar" : "Sí, desactivar",
      icon: "question",
    });
    if (!confirmed) return;

    try {
      await updateStudentStatus(token, student.id, !student.active);
      await loadStudents();
      showSuccess(student.active ? "Alumno desactivado" : "Alumno activado");
    } catch (err) {
      showError(
        err instanceof StudentsApiError ? err.message : "No se pudo actualizar el estado",
      );
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Alumnos"
        description="Registra estudiantes, particulares y trabajadores. Todos comparten datos generales; cada tipo tendrá campos adicionales."
        action={
          !showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
            >
              Nuevo alumno
            </button>
          ) : undefined
        }
      />

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nuevo alumno</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Elige el tipo y completa la información general. Los campos extra dependen del tipo.
          </p>
          <div className="mt-6">
            <CreateStudentForm
              onCancel={() => setShowCreate(false)}
              onSubmit={async (input) => {
                const token = authStorage.getToken();
                if (!token) return;
                const { student } = await createStudent(token, input);
                setShowCreate(false);
                setPage(1);
                await loadStudents();
                await showCredentialsCreated({
                  title: "Alumno creado",
                  email: input.email,
                  password: input.password,
                });
                router.push(`/admin/alumnos/${student.id}`);
              }}
            />
          </div>
        </div>
      )}

      {!showCreate && (
        <div className="rounded-2xl border border-brand-line bg-white">
          <div className="flex flex-col gap-4 border-b border-brand-line p-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue lg:w-72"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("all");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  typeFilter === "all"
                    ? "bg-brand-blue text-white"
                    : "bg-brand-light text-brand-gray"
                }`}
              >
                Todos los tipos
              </button>
              {ALUMNO_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTypeFilter(option.value);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    typeFilter === option.value
                      ? "bg-brand-blue text-white"
                      : "bg-brand-light text-brand-gray"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-brand-line px-4 py-3">
            {(["all", "active", "inactive"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  filter === value ? "bg-brand-gray text-white" : "bg-brand-light text-brand-gray"
                }`}
              >
                {value === "all" ? "Todos" : value === "active" ? "Activos" : "Inactivos"}
              </button>
            ))}
          </div>

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
      )}
    </>
  );
}
