"use client";

import Link from "next/link";
import type { CourseListItem } from "@/core/domain/courses/types";
import { MODALITY_LABELS, type CourseModality } from "@/core/domain/courses/types";
import { CourseStatusBadge } from "@/presentation/components/courses/course-status-badge";
import { Tooltip } from "@/presentation/components/ui/tooltip";

interface CoursesTableProps {
  courses: CourseListItem[];
  isLoading: boolean;
  showInstructor?: boolean;
  deletingId?: string | null;
  onDelete: (course: CourseListItem) => void;
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0115.918 21H8.082a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export function CoursesTable({
  courses,
  isLoading,
  showInstructor = false,
  deletingId,
  onDelete,
}: CoursesTableProps) {
  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">Cargando cursos...</div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">
        No hay cursos. Crea el primero con el botón de arriba.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
          <tr>
            <th className="px-6 py-3 font-semibold">Curso</th>
            {showInstructor && <th className="px-4 py-3 font-semibold">Instructor</th>}
            <th className="px-4 py-3 font-semibold">Publicación</th>
            <th className="px-4 py-3 font-semibold">Clases</th>
            <th className="px-4 py-3 font-semibold">Estudiantes</th>
            <th className="px-4 py-3 font-semibold">Catálogo</th>
            <th className="px-6 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-line">
          {courses.map((course) => {
            const modality =
              course.modality && course.modality in MODALITY_LABELS
                ? MODALITY_LABELS[course.modality as CourseModality]
                : course.modality;
            const isDeleting = deletingId === course.id;

            return (
              <tr key={course.id} className="hover:bg-brand-light/40">
                <td className="px-6 py-4">
                  <div className="font-medium text-brand-gray">{course.title}</div>
                  <div className="mt-0.5 text-xs text-brand-muted">
                    /{course.slug}
                    {modality ? ` · ${modality}` : ""}
                  </div>
                </td>
                {showInstructor && (
                  <td className="px-4 py-4 text-brand-muted">
                    {course.instructorName?.trim() || (
                      <span className="italic text-brand-muted/80">Sin asignar</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-4">
                  <CourseStatusBadge status={course.status} />
                </td>
                <td className="px-4 py-4 text-brand-muted">{course.lessonsCount}</td>
                <td className="px-4 py-4 text-brand-muted">{course.studentsCount}</td>
                <td className="px-4 py-4 text-brand-muted">
                  {course.showInCatalog ? "Sí" : "No"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Tooltip label="Editar curso">
                      <Link
                        href={`/admin/cursos/${course.id}`}
                        aria-label="Editar curso"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-blue transition-colors hover:bg-brand-blue/5"
                      >
                        <EditIcon />
                      </Link>
                    </Tooltip>
                    <Tooltip label="Eliminar curso">
                      <button
                        type="button"
                        aria-label="Eliminar curso"
                        disabled={isDeleting}
                        onClick={() => onDelete(course)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <TrashIcon />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
