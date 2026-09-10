"use client";

import { useState } from "react";
import type { AlumnoType } from "@/core/domain/students/alumno-types";
import { ALUMNO_TYPE_OPTIONS } from "@/core/domain/students/alumno-types";
import type { CreateStudentInput } from "@/core/domain/students/types";
import { StudentsApiError } from "@/infrastructure/http/students-api";
import { showError, showValidationError, showWarning } from "@/shared/lib/alerts";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";
import {
  AlumnoProfileFields,
  emptyAlumnoProfileValues,
  profileValuesToPayload,
} from "@/presentation/components/admin/students/alumno-profile-fields";

interface CreateStudentFormProps {
  onSubmit: (input: CreateStudentInput) => Promise<void>;
  onCancel: () => void;
}

export function CreateStudentForm({ onSubmit, onCancel }: CreateStudentFormProps) {
  const [alumnoType, setAlumnoType] = useState<AlumnoType>("particular");
  const [values, setValues] = useState(emptyAlumnoProfileValues);
  const [password, setPassword] = useState(generatePassword());
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      const profile = profileValuesToPayload(values);
      await onSubmit({
        ...profile,
        password,
        alumnoType,
        active: true,
      });
    } catch (err) {
      if (err instanceof StudentsApiError && err.code === "VALIDATION_ERROR") {
        await showValidationError(err.details, err.message);
        return;
      }
      showError(err instanceof StudentsApiError ? err.message : "No se pudo crear el alumno");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
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

      <div className="rounded-2xl border border-brand-line bg-white p-5">
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Contraseña inicial *
        </label>
        <PasswordField
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          showGenerate
          onGenerate={() => setPassword(generatePassword())}
        />
        <p className="mt-1.5 text-xs text-brand-muted">
          Comparte estas credenciales con el alumno cuando le des acceso.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Crear alumno"}
        </button>
      </div>
    </form>
  );
}
