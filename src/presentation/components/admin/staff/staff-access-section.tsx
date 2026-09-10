"use client";

import { useState } from "react";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  StaffApiError,
  sendStaffAccess,
  updateStaff,
} from "@/infrastructure/http/staff-api";
import {
  showError,
  showInfo,
  showSaved,
  showSuccess,
  showWarning,
} from "@/shared/lib/alerts";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";

interface StaffAccessSectionProps {
  staffId: string;
  email: string;
}

export function StaffAccessSection({ staffId, email }: StaffAccessSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [accessEmailed, setAccessEmailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  function startEditing() {
    setPassword(generatePassword());
    setIsEditing(true);
  }

  function cancelEditing() {
    setPassword("");
    setIsEditing(false);
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess("Contraseña copiada al portapapeles");
    } catch {
      showWarning("Copia la contraseña manualmente.");
    }
  }

  async function handleSave(sendEmail: boolean) {
    const token = authStorage.getToken();
    if (!token) {
      showError("Vuelve a iniciar sesión en el panel.");
      return;
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      showWarning("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      await updateStaff(token, staffId, {
        password: trimmedPassword,
        sendAccessEmail: sendEmail,
      });
      setSavedPassword(trimmedPassword);
      setAccessEmailed(sendEmail);
      setPassword("");
      setIsEditing(false);
      if (sendEmail) {
        showSaved(`Contraseña guardada y accesos enviados a ${email}.`);
      } else {
        showSaved("Contraseña actualizada correctamente.");
      }
    } catch (err) {
      showError(
        err instanceof StaffApiError ? err.message : "No se pudo actualizar la contraseña",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResendAccess() {
    const token = authStorage.getToken();
    if (!token) {
      showError("Vuelve a iniciar sesión en el panel.");
      return;
    }
    if (!savedPassword) {
      showWarning("Primero guarda una contraseña nueva para poder enviarla.");
      return;
    }

    setIsSending(true);
    try {
      await sendStaffAccess(token, staffId, savedPassword);
      setAccessEmailed(true);
      showSuccess(`Accesos reenviados a ${email}.`);
    } catch (err) {
      showError(
        err instanceof StaffApiError ? err.message : "No se pudo enviar el correo de accesos",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6">
      <h2 className="font-display text-lg font-bold text-brand-gray">Acceso al panel</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Credenciales que usa el instructor para entrar al panel en &quot;Iniciar sesión&quot;.
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
                  La contraseña guardada está cifrada en el servidor y no puede recuperarse. Aquí
                  defines una nueva. Puedes guardarla sola o enviársela al instructor por correo.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSave(true)}
                    disabled={isSaving || password.length < 6}
                    className="rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
                  >
                    {isSaving ? "Guardando..." : "Guardar y enviar por correo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave(false)}
                    disabled={isSaving || password.length < 6}
                    className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-60"
                  >
                    Solo guardar
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
                    <PasswordField value={savedPassword} onChange={() => {}} readOnly />
                    <button
                      type="button"
                      onClick={() => void copyPassword(savedPassword)}
                      className="text-sm font-medium text-brand-blue hover:underline"
                    >
                      Copiar contraseña
                    </button>
                  </div>
                ) : (
                  <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-muted">
                    La contraseña está protegida en el servidor. Actualízala para generar una nueva y
                    compartirla o enviarla al instructor.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
                  >
                    {savedPassword ? "Cambiar contraseña" : "Actualizar contraseña"}
                  </button>
                  {savedPassword ? (
                    <button
                      type="button"
                      onClick={() => void handleResendAccess()}
                      disabled={isSending}
                      className="rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
                    >
                      {isSending
                        ? "Enviando..."
                        : accessEmailed
                          ? "Reenviar accesos por correo"
                          : "Enviar accesos por correo"}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </dd>
        </div>
      </dl>

      {savedPassword && !isEditing && (
        <button
          type="button"
          onClick={() =>
            showInfo(
              `Usa el correo ${email} y la contraseña que acabas de guardar en el login del panel.`,
              "Credenciales del instructor",
            )
          }
          className="mt-4 text-sm font-medium text-brand-blue hover:underline"
        >
          Ver recordatorio de acceso
        </button>
      )}
    </div>
  );
}
