"use client";

import { useState } from "react";
import type { CreateCompanyInput } from "@/core/domain/companies/types";
import { CompaniesApiError } from "@/infrastructure/http/companies-api";
import { showError } from "@/shared/lib/alerts";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";
import {
  CompanyProfileFields,
  type CompanyProfileFormValues,
} from "@/presentation/components/admin/companies/company-profile-fields";

interface CreateCompanyFormProps {
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
  onCancel: () => void;
}

const initialValues: CompanyProfileFormValues = {
  name: "",
  rfc: "",
  employerRepresentative: "",
  workersRepresentative: "",
  workersCount: "",
};

export function CreateCompanyForm({ onSubmit, onCancel }: CreateCompanyFormProps) {
  const [values, setValues] = useState<CompanyProfileFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withAccess, setWithAccess] = useState(false);
  const [accessEmail, setAccessEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [sendAccessEmail, setSendAccessEmail] = useState(false);
  const [accessErrors, setAccessErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CompanyProfileFormValues, string>>
  >({});

  function updateField<K extends keyof CompanyProfileFormValues>(
    field: K,
    value: CompanyProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setAccessErrors({});

    try {
      await onSubmit({
        name: values.name.trim(),
        rfc: values.rfc.trim() || null,
        employerRepresentative: values.employerRepresentative.trim() || null,
        workersRepresentative: values.workersRepresentative.trim() || null,
        workersCount: values.workersCount ? Number(values.workersCount) : null,
        ...(withAccess
          ? { accessEmail: accessEmail.trim(), password: password.trim(), sendAccessEmail }
          : {}),
      });
    } catch (err) {
      if (err instanceof CompaniesApiError && err.fields.length > 0) {
        const next: Partial<Record<keyof CompanyProfileFormValues, string>> = {};
        for (const f of err.fields) {
          if (f.field in values) next[f.field as keyof CompanyProfileFormValues] = f.message;
        }
        setFieldErrors(next);
        setAccessErrors(
          Object.fromEntries(
            err.fields
              .filter((f) => f.field === "accessEmail" || f.field === "password")
              .map((f) => [f.field, f.message]),
          ),
        );
      }
      showError(err instanceof CompaniesApiError ? err.message : "No se pudo crear la empresa");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CompanyProfileFields values={values} onChange={updateField} errors={fieldErrors} />

      <div className="rounded-xl border border-brand-line p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-gray">
          <input
            type="checkbox"
            checked={withAccess}
            onChange={(e) => setWithAccess(e.target.checked)}
            className="h-4 w-4 accent-brand-black"
          />
          Dar acceso a la empresa (&quot;¿Eres empresa?&quot;)
        </label>
        {withAccess && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-gray">Correo de acceso</label>
              <input
                type="email"
                value={accessEmail}
                onChange={(e) => {
                  setAccessEmail(e.target.value);
                  setAccessErrors((x) => ({ ...x, accessEmail: "" }));
                }}
                required
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
              {accessErrors.accessEmail && (
                <p className="mt-1 text-xs font-medium text-red-700">{accessErrors.accessEmail}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-gray">Contraseña</label>
              <PasswordField
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setAccessErrors((x) => ({ ...x, password: "" }));
                }}
                required
                minLength={6}
                showGenerate
                onGenerate={() => setPassword(generatePassword())}
              />
              {accessErrors.password && (
                <p className="mt-1 text-xs font-medium text-red-700">{accessErrors.password}</p>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-gray">
              <input
                type="checkbox"
                checked={sendAccessEmail}
                onChange={(e) => setSendAccessEmail(e.target.checked)}
                className="h-4 w-4 accent-brand-black"
              />
              Enviar accesos por correo
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Crear empresa"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-brand-line px-5 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
