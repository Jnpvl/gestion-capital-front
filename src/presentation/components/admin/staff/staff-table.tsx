import type { StaffListItem } from "@/core/domain/staff/types";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";
import { StaffRoleBadge } from "@/presentation/components/admin/staff/staff-role-badge";
import { Tooltip } from "@/presentation/components/ui/tooltip";
import { cn } from "@/shared/lib/cn";

interface StaffTableProps {
  staff: StaffListItem[];
  currentUserId: string;
  isLoading: boolean;
  onToggleStatus: (member: StaffListItem) => void;
}

function ToggleStatusButton({
  member,
  currentUserId,
  onToggleStatus,
}: {
  member: StaffListItem;
  currentUserId: string;
  onToggleStatus: (member: StaffListItem) => void;
}) {
  const isSelf = member.id === currentUserId;
  const label = member.active
    ? "Desactivar acceso del usuario"
    : "Activar acceso del usuario";

  if (isSelf) {
    return (
      <Tooltip label="No puedes desactivar tu propia cuenta">
        <span className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-brand-line text-brand-muted/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={() => onToggleStatus(member)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line text-brand-muted transition-colors hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
          member.active ? "hover:border-red-200 hover:text-red-600" : "hover:border-emerald-200 hover:text-emerald-600",
        )}
      >
        {member.active ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </Tooltip>
  );
}

export function StaffTable({
  staff,
  currentUserId,
  isLoading,
  onToggleStatus,
}: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">Cargando staff...</div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-brand-muted">
        No hay usuarios registrados.
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
                Usuario
              </th>
              <th className="w-36 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Rol
              </th>
              <th className="w-28 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Estado
              </th>
              <th className="w-20 px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {staff.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-brand-light/50">
                <td className="px-6 py-4 align-middle">
                  <p className="font-medium text-brand-gray">{member.name}</p>
                  <p className="mt-0.5 truncate text-xs text-brand-muted">{member.email}</p>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <StaffRoleBadge role={member.role} />
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <StudentStatusBadge active={member.active} />
                </td>
                <td className="overflow-visible px-6 py-4 text-right align-middle">
                  <ToggleStatusButton
                    member={member}
                    currentUserId={currentUserId}
                    onToggleStatus={onToggleStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-brand-line md:hidden">
        {staff.map((member) => (
          <article key={member.id} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-brand-gray">{member.name}</p>
              <p className="mt-0.5 truncate text-xs text-brand-muted">{member.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StaffRoleBadge role={member.role} />
                <StudentStatusBadge active={member.active} />
              </div>
            </div>
            <ToggleStatusButton
              member={member}
              currentUserId={currentUserId}
              onToggleStatus={onToggleStatus}
            />
          </article>
        ))}
      </div>
    </>
  );
}
