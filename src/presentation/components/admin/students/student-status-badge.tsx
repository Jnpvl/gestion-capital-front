import { cn } from "@/shared/lib/cn";

interface StudentStatusBadgeProps {
  active: boolean;
}

export function StudentStatusBadge({ active }: StudentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-brand-muted",
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
