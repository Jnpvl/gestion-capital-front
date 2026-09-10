"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseListItem } from "@/core/domain/courses/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  createCourse,
  CoursesApiError,
  listCourses,
} from "@/infrastructure/http/courses-api";
import { showError } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CoursesTable } from "@/presentation/components/admin/courses/courses-table";

type FilterValue = "all" | "draft" | "published";
const PAGE_SIZE = 10;

export function CoursesPageContent() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadCourses = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

    try {
      const result = await listCourses(token, {
        search: debouncedSearch || undefined,
        status: filter === "all" ? undefined : filter,
        page,
        limit: PAGE_SIZE,
      });
      setCourses(result.courses);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(err instanceof CoursesApiError ? err.message : "Error al cargar cursos");
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
    void loadCourses();
  }, [loadCourses]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const token = authStorage.getToken();
    if (!token) return;

    setIsCreating(true);

    try {
      const { course } = await createCourse(token, title);
      router.push(`/admin/cursos/${course.id}`);
    } catch (err) {
      showError(err instanceof CoursesApiError ? err.message : "No se pudo crear el curso");
      setIsCreating(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Cursos"
        description="Crea cursos, configura su página promocional y organiza el contenido por clases."
        action={
          <button
            type="button"
            onClick={() => {
              setShowCreate(true);
              setNewTitle("");
            }}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
          >
            Nuevo curso
          </button>
        }
      />

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nuevo curso</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Empieza con un título. Podrás completar la promoción y el contenido después.
          </p>
          <form onSubmit={(e) => void handleCreate(e)} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="course-title" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Título del curso
              </label>
              <input
                id="course-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. NOM-035 Factores de Riesgo Psicosocial"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !newTitle.trim()}
                className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {isCreating ? "Creando..." : "Crear y editar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-col gap-4 border-b border-brand-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue sm:w-72"
          />
          <div className="flex gap-2">
            {(["all", "draft", "published"] as const).map((value) => (
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
                {value === "all" ? "Todos" : value === "draft" ? "Borradores" : "Publicados"}
              </button>
            ))}
          </div>
        </div>

        <CoursesTable courses={courses} isLoading={isLoading} />

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
