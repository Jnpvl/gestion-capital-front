"use client";

import { useState } from "react";
import type { CreateStudentInput } from "@/core/domain/students/types";
import { StudentsApiError } from "@/infrastructure/http/students-api";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";

interface CreateStudentFormProps {
  onSubmit: (input: CreateStudentInput) => Promise<void>;
  onCancel: () => void;
}

export function CreateStudentForm({ onSubmit, onCancel }: CreateStudentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        email,
        password,
        phone: phone || undefined,
        notes: notes || undefined,
        active: true,
      });
    } catch (err) {
      setError(err instanceof StudentsApiError ? err.message : "No se pudo crear el estudiante");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">Nombre *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">Correo *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">
            Notas internas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej. Solicitó info por WhatsApp, curso de interés..."
            className="w-full resize-y rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
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
          {isSubmitting ? "Creando..." : "Crear estudiante"}
        </button>
      </div>
    </form>
  );
}
