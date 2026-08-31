"use client";

import { useState } from "react";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { StudentsApiError, updateStudent } from "@/infrastructure/http/students-api";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";

interface StudentAccessSectionProps {
  studentId: string;
  email: string;
}

export function StudentAccessSection({ studentId, email }: StudentAccessSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function startEditing() {
    setPassword(generatePassword());
    setError("");
    setCopied(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setPassword("");
    setError("");
    setIsEditing(false);
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar al portapapeles. Copia la contraseña manualmente.");
    }
  }

  async function handleSave() {
    const token = authStorage.getToken();
    if (!token) {
      setError("Tu sesión de administrador expiró. Vuelve a iniciar sesión en el panel.");
      return;
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await updateStudent(token, studentId, { password: trimmedPassword });
      setSavedPassword(trimmedPassword);
      setPassword("");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof StudentsApiError ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6">
      <h2 className="font-display text-lg font-bold text-brand-gray">Acceso al aula</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Credenciales que usa el alumno en &quot;Ingresar a mis cursos&quot;.
      </p>

      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="text-brand-muted">Correo</dt>
          <dd className="font-medium text-brand-gray">{email}</dd>
        </div>

        <div>
          <dt className="mb-1.5 text-brand-muted">Contraseña</dt>
          <dd>
            {isEditing ? (
              <div className="space-y-3">
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                  showGenerate
                  onGenerate={() => setPassword(generatePassword())}
                />
                <p className="text-xs text-brand-muted">
                  La contraseña guardada está cifrada en el servidor y no puede recuperarse. Aquí defines una nueva.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving || password.length < 6}
                    className="rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
                  >
                    {isSaving ? "Guardando..." : "Guardar contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPassword ? (
                  <div className="space-y-2">
                    <PasswordField
                      value={savedPassword}
                      onChange={() => {}}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => void copyPassword(savedPassword)}
                      className="text-sm font-medium text-brand-blue hover:underline"
                    >
                      {copied ? "Copiada al portapapeles" : "Copiar contraseña"}
                    </button>
                  </div>
                ) : (
                  <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-muted">
                    La contraseña está protegida en el servidor. Actualízala para generar una nueva y compartirla con el alumno.
                  </p>
                )}
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
                >
                  {savedPassword ? "Cambiar contraseña" : "Actualizar contraseña"}
                </button>
              </div>
            )}
          </dd>
        </div>
      </dl>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {savedPassword && !isEditing && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Contraseña guardada. Usa exactamente <strong>{savedPassword}</strong> en &quot;Ingresar a mis cursos&quot; con el correo <strong>{email}</strong>.
        </p>
      )}
    </div>
  );
}
