import type { AlumnoType } from "@/core/domain/students/alumno-types";
import { ALUMNO_TYPE_LABELS } from "@/core/domain/students/alumno-types";
import { cn } from "@/shared/lib/cn";

const TYPE_STYLES: Record<AlumnoType, string> = {
  estudiante: "bg-violet-50 text-violet-700",
  particular: "bg-sky-50 text-sky-700",
  trabajador: "bg-amber-50 text-amber-800",
};

export function AlumnoTypeBadge({ type }: { type: AlumnoType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        TYPE_STYLES[type],
      )}
    >
      {ALUMNO_TYPE_LABELS[type]}
    </span>
  );
}
