import Link from "next/link";
import type { CourseListItem } from "@/core/domain/courses/types";
import { MODALITY_LABELS, type CourseModality } from "@/core/domain/courses/types";
import { CourseStatusBadge } from "@/presentation/components/courses/course-status-badge";
import { Tooltip } from "@/presentation/components/ui/tooltip";

interface CoursesTableProps {
  courses: CourseListItem[];
  isLoading: boolean;
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

export function CoursesTable({ courses, isLoading }: CoursesTableProps) {
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
            <th className="px-4 py-3 font-semibold">Publicación</th>
            <th className="px-4 py-3 font-semibold">Clases</th>
            <th className="px-4 py-3 font-semibold">Estudiantes</th>
            <th className="px-4 py-3 font-semibold">Catálogo</th>
            <th className="px-4 py-3 font-semibold">Destacado</th>
            <th className="px-6 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-line">
          {courses.map((course) => {
            const modality =
              course.modality && course.modality in MODALITY_LABELS
                ? MODALITY_LABELS[course.modality as CourseModality]
                : course.modality;

            return (
              <tr key={course.id} className="hover:bg-brand-light/40">
                <td className="px-6 py-4">
                  <div className="font-medium text-brand-gray">{course.title}</div>
                  <div className="mt-0.5 text-xs text-brand-muted">
                    /{course.slug}
                    {modality ? ` · ${modality}` : ""}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <CourseStatusBadge status={course.status} />
                </td>
                <td className="px-4 py-4 text-brand-muted">{course.lessonsCount}</td>
                <td className="px-4 py-4 text-brand-muted">{course.studentsCount}</td>
                <td className="px-4 py-4 text-brand-muted">
                  {course.showInCatalog ? "Sí" : "No"}
                </td>
                <td className="px-4 py-4 text-brand-muted">{course.featured ? "Sí" : "No"}</td>
                <td className="px-6 py-4 text-right">
                  <Tooltip label="Editar curso">
                    <Link
                      href={`/admin/cursos/${course.id}`}
                      aria-label="Editar curso"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-blue transition-colors hover:bg-brand-blue/5"
                    >
                      <EditIcon />
                    </Link>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
