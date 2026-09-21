"use client";

import { useEffect, useMemo, useState } from "react";
import type { StaffListItem } from "@/core/domain/staff/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { listStaff, StaffApiError } from "@/infrastructure/http/staff-api";

export const UNASSIGNED_INSTRUCTOR_FILTER = "unassigned";

interface CourseInstructorSelectProps {
  value: string;
  onChange: (instructorId: string) => void;
  /** Keep an already-assigned instructor visible even if inactive. */
  currentInstructor?: { id: string; name: string } | null;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  label?: string;
  hint?: string;
  /** assign: empty = sin asignar. filter: empty = todos, "unassigned" = sin asignar. */
  variant?: "assign" | "filter";
  className?: string;
  /** Extra classes for the select control (e.g. compact filter). */
  selectClassName?: string;
}

export function CourseInstructorSelect({
  value,
  onChange,
  currentInstructor,
  disabled,
  required,
  id = "course-instructor",
  label = "Instructor asignado",
  hint = "Solo administradores pueden asignar o cambiar el instructor del curso.",
  variant = "assign",
  className,
  selectClassName,
}: CourseInstructorSelectProps) {
  const [instructors, setInstructors] = useState<StaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const pageSize = 50;
        const first = await listStaff(token, {
          role: "teacher",
          active: true,
          page: 1,
          limit: pageSize,
        });
        if (cancelled) return;

        const all = [...first.staff];
        for (let page = 2; page <= first.totalPages; page += 1) {
          const next = await listStaff(token, {
            role: "teacher",
            active: true,
            page,
            limit: pageSize,
          });
          if (cancelled) return;
          all.push(...next.staff);
        }

        setInstructors(all);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof StaffApiError
              ? err.message
              : "No se pudo cargar la lista de instructores",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const member of instructors) {
      map.set(member.id, { id: member.id, name: member.name });
    }
    if (currentInstructor?.id && !map.has(currentInstructor.id)) {
      map.set(currentInstructor.id, currentInstructor);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [instructors, currentInstructor]);

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-gray">
          {label}
          {required ? " *" : ""}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        disabled={disabled || isLoading}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={
          selectClassName ??
          "w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:opacity-60"
        }
      >
        {variant === "filter" ? (
          <>
            <option value="">{isLoading ? "Cargando..." : "Todos (instructor)"}</option>
            <option value={UNASSIGNED_INSTRUCTOR_FILTER}>Sin asignar</option>
          </>
        ) : (
          <option value="">{isLoading ? "Cargando instructores..." : "Sin asignar"}</option>
        )}
        {options.map((instructor) => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.name}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
