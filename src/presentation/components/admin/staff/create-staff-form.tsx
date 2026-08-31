"use client";

import { useState } from "react";
import type { StaffRole } from "@/core/domain/auth/types";
import type { CreateStaffInput } from "@/core/domain/staff/types";
import { StaffApiError } from "@/infrastructure/http/staff-api";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";

interface CreateStaffFormProps {
  onSubmit: (input: CreateStaffInput) => Promise<void>;
  onCancel: () => void;
}

export function CreateStaffForm({ onSubmit, onCancel }: CreateStaffFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState<StaffRole>("teacher");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({ name, email, password, role, active: true });
    } catch (err) {
      setError(err instanceof StaffApiError ? err.message : "No se pudo crear el usuario");
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
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">Rol *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          >
            <option value="teacher">Maestro</option>
            <option value="admin">Administrador</option>
          </select>
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
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
