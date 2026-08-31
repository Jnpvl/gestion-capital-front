import { cn } from "@/shared/lib/cn";
import type { CourseStatus } from "@/core/domain/courses/types";

const labels: Record<CourseStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
};

const styles: Record<CourseStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
};

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[status])}>
      {labels[status]}
    </span>
  );
}
