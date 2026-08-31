import Link from "next/link";
import type { StudentListItem } from "@/core/domain/students/types";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";
import { Tooltip } from "@/presentation/components/ui/tooltip";
import { cn } from "@/shared/lib/cn";

interface StudentsTableProps {
  students: StudentListItem[];
  isLoading: boolean;
  onToggleStatus: (student: StudentListItem) => void;
}

function IconButton({
  className,
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-muted transition-colors hover:bg-brand-light hover:text-brand-gray focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function ViewIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function DeactivateIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function ActivateIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StudentRowActions({
  student,
  onToggleStatus,
}: {
  student: StudentListItem;
  onToggleStatus: (student: StudentListItem) => void;
}) {
  const toggleLabel = student.active
    ? "Desactivar acceso del estudiante"
    : "Activar acceso del estudiante";

  return (
    <div className="inline-flex items-center gap-2">
      <Tooltip label="Ver detalle del estudiante">
        <Link
          href={`/admin/estudiantes/${student.id}`}
          aria-label="Ver detalle del estudiante"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-blue transition-colors hover:bg-brand-blue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <ViewIcon />
        </Link>
      </Tooltip>
      <IconButton
        label={toggleLabel}
        onClick={() => onToggleStatus(student)}
        className={student.active ? "hover:border-red-200 hover:text-red-600" : "hover:border-emerald-200 hover:text-emerald-600"}
      >
        {student.active ? <DeactivateIcon /> : <ActivateIcon />}
      </IconButton>
    </div>
  );
}

export function StudentsTable({ students, isLoading, onToggleStatus }: StudentsTableProps) {
  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">
        Cargando estudiantes...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">
        No hay estudiantes registrados.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-visible md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-line bg-brand-light/60">
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Estudiante
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Teléfono
              </th>
              <th className="w-24 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Cursos
              </th>
              <th className="w-28 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Estado
              </th>
              <th className="w-28 px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {students.map((student) => (
              <tr key={student.id} className="transition-colors hover:bg-brand-light/50">
                <td className="px-6 py-4 align-middle">
                  <Link
                    href={`/admin/estudiantes/${student.id}`}
                    className="block font-medium text-brand-gray hover:text-brand-blue"
                  >
                    {student.name}
                  </Link>
                  <span className="mt-0.5 block truncate text-xs text-brand-muted">
                    {student.email}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle whitespace-nowrap text-brand-muted">
                  {student.phone ?? "—"}
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-light px-2 text-xs font-semibold text-brand-gray">
                    {student.coursesCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <StudentStatusBadge active={student.active} />
                </td>
                <td className="overflow-visible px-6 py-4 text-right align-middle">
                  <StudentRowActions student={student} onToggleStatus={onToggleStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-brand-line md:hidden">
        {students.map((student) => (
          <article key={student.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/estudiantes/${student.id}`}
                  className="font-medium text-brand-gray hover:text-brand-blue"
                >
                  {student.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-brand-muted">{student.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <StudentStatusBadge active={student.active} />
                <StudentRowActions student={student} onToggleStatus={onToggleStatus} />
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-brand-muted">Teléfono</dt>
                <dd className="font-medium text-brand-gray">{student.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Cursos</dt>
                <dd className="font-medium text-brand-gray">{student.coursesCount}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
