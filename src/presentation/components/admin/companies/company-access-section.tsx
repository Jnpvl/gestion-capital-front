"use client";

import { useState } from "react";
import type { CompanyDetail } from "@/core/domain/companies/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { CompaniesApiError, updateCompanyAccess } from "@/infrastructure/http/companies-api";
import { showError, showSaved, showSuccess, showWarning } from "@/shared/lib/alerts";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";

/** Acceso de la empresa al portal "¿Eres empresa?" (mismo flujo que el acceso del alumno). */
export function CompanyAccessSection({
  company,
  onUpdated,
}: {
  company: CompanyDetail;
  onUpdated: (company: CompanyDetail) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(company.accessEmail ?? "");
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  function start() {
    setEmail(company.accessEmail ?? "");
    setPassword(company.hasAccess ? "" : generatePassword());
    setErrors({});
    setIsEditing(true);
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess("Contraseña copiada al portapapeles");
    } catch {
      showWarning("Copia la contraseña manualmente.");
    }
  }

  async function save(sendEmail: boolean) {
    const token = authStorage.getToken();
    if (!token) {
      showError("Vuelve a iniciar sesión en el panel.");
      return;
    }
    const pwd = password.trim();
    setIsSaving(true);
    setErrors({});
    try {
      const { company: updated } = await updateCompanyAccess(token, company.id, {
        accessEmail: email.trim(),
        password: pwd || null,
        sendAccessEmail: sendEmail && !!pwd,
      });
      onUpdated(updated);
      setSavedPassword(pwd || null);
      setPassword("");
      setIsEditing(false);
      showSaved(
        sendEmail && pwd
          ? `Acceso guardado y enviado a ${updated.accessEmail}.`
          : "Acceso de la empresa guardado.",
      );
    } catch (err) {
      if (err instanceof CompaniesApiError && err.fields.length > 0) {
        setErrors(Object.fromEntries(err.fields.map((f) => [f.field, f.message])));
      }
      showError(err instanceof CompaniesApiError ? err.message : "No se pudo guardar el acceso");
    } finally {
      setIsSaving(false);
    }
  }

  const needsPassword = !company.hasAccess;
  const canSave = email.trim().length > 3 && (!needsPassword || password.trim().length >= 6) &&
    (password.trim().length === 0 || password.trim().length >= 6);

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6">
      <h2 className="font-display text-lg font-bold text-brand-gray">Acceso de la empresa</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Credenciales que usa la empresa en &quot;¿Eres empresa?&quot;.
      </p>

      {isEditing ? (
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <label className="mb-1.5 block font-medium text-brand-gray">Correo de acceso</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((x) => ({ ...x, accessEmail: "" }));
              }}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
            {errors.accessEmail && <p className="mt-1 text-xs font-medium text-red-700">{errors.accessEmail}</p>}
          </div>
          <div>
            <label className="mb-1.5 block font-medium text-brand-gray">
              Contraseña{company.hasAccess && <span className="font-normal text-brand-muted"> (déjala vacía para no cambiarla)</span>}
            </label>
            <PasswordField
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErrors((x) => ({ ...x, password: "" }));
              }}
              minLength={6}
              showGenerate
              onGenerate={() => setPassword(generatePassword())}
            />
            {errors.password && <p className="mt-1 text-xs font-medium text-red-700">{errors.password}</p>}
            <p className="mt-1 text-xs text-brand-muted">
              La contraseña se guarda cifrada y no puede recuperarse; solo puedes definir una nueva.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void save(true)}
              disabled={isSaving || !canSave || !password.trim()}
              className="rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar y enviar por correo"}
            </button>
            <button
              type="button"
              onClick={() => void save(false)}
              disabled={isSaving || !canSave}
              className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-60"
            >
              Solo guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-sm">
          <dl className="space-y-3">
            <div>
              <dt className="text-brand-muted">Correo</dt>
              <dd className="font-medium text-brand-gray">{company.accessEmail ?? "Sin acceso"}</dd>
            </div>
            {company.hasAccess && (
              <div>
                <dt className="text-brand-muted">Último ingreso</dt>
                <dd className="font-medium text-brand-gray">
                  {company.lastLoginAt
                    ? new Date(company.lastLoginAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
                    : "Aún no ingresa"}
                </dd>
              </div>
            )}
          </dl>
          {savedPassword && (
            <div className="space-y-2">
              <PasswordField value={savedPassword} onChange={() => {}} readOnly />
              <button
                type="button"
                onClick={() => void copy(savedPassword)}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Copiar contraseña
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={start}
            className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            {company.hasAccess ? "Cambiar acceso" : "Dar acceso"}
          </button>
        </div>
      )}
    </div>
  );
}
