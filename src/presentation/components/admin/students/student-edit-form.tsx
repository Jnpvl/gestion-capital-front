"use client";

import { useEffect, useState } from "react";
import type { AlumnoType } from "@/core/domain/students/alumno-types";
import { ALUMNO_TYPE_OPTIONS } from "@/core/domain/students/alumno-types";
import type { StudentDetail, UpdateStudentInput } from "@/core/domain/students/types";
import { StudentsApiError, updateStudent } from "@/infrastructure/http/students-api";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { showError, showSaved, showValidationError, showWarning } from "@/shared/lib/alerts";
import {
  AlumnoProfileFields,
  profileValuesFromStudent,
  profileValuesToPayload,
} from "@/presentation/components/admin/students/alumno-profile-fields";

interface StudentEditFormProps {
  student: StudentDetail;
  onUpdated: (student: StudentDetail) => void;
}

export function StudentEditForm({ student, onUpdated }: StudentEditFormProps) {
  const [alumnoType, setAlumnoType] = useState<AlumnoType>(student.alumnoType);
  const [values, setValues] = useState(() => profileValuesFromStudent(student));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAlumnoType(student.alumnoType);
    setValues(profileValuesFromStudent(student));
  }, [student]);

  function updateField<K extends keyof typeof values>(field: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!values.firstNames.trim() || !values.paternalLastName.trim()) {
      showWarning("Completa nombre y apellido paterno");
      return;
    }

    if (!values.gender) {
      showWarning("Selecciona el sexo del alumno");
      return;
    }

    const token = authStorage.getToken();
    if (!token) return;

    const profile = profileValuesToPayload(values);
    const payload: UpdateStudentInput = {
      ...profile,
      alumnoType,
    };

    setIsSaving(true);

    try {
      const { student: updated } = await updateStudent(token, student.id, payload);
      onUpdated(updated);
      showSaved();
    } catch (err) {
      if (err instanceof StudentsApiError && err.code === "VALIDATION_ERROR") {
        await showValidationError(err.details, err.message);
        return;
      }
      showError(err instanceof StudentsApiError ? err.message : "No se pudo guardar el alumno");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="rounded-2xl border border-brand-line bg-brand-light/40 p-5">
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">Tipo de alumno</label>
        <select
          value={alumnoType}
          onChange={(e) => setAlumnoType(e.target.value as AlumnoType)}
          className="w-full max-w-sm rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        >
          {ALUMNO_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-brand-muted">
          Solo para clasificación interna. No afecta los campos del formulario.
        </p>
      </div>

      <AlumnoProfileFields values={values} onChange={updateField} />

      <div className="flex items-center justify-between gap-3 border-t border-brand-line pt-4">
        <p className="text-xs text-brand-muted">
          Registrado: {new Date(student.createdAt).toLocaleDateString("es-MX")}
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
