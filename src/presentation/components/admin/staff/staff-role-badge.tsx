import type { StaffRole } from "@/core/domain/auth/types";
import { cn } from "@/shared/lib/cn";

const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super admin",
  admin: "Administrador",
  teacher: "Instructor",
};

const roleStyles: Record<StaffRole, string> = {
  super_admin: "bg-brand-black text-white",
  admin: "bg-brand-blue/10 text-brand-blue",
  teacher: "bg-brand-gold/15 text-brand-gray",
};

export function StaffRoleBadge({ role }: { role: StaffRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        roleStyles[role],
      )}
    >
      {roleLabels[role]}
    </span>
  );
}
