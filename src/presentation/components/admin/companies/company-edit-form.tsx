"use client";

import { useEffect, useState } from "react";
import type { CompanyDetail, UpdateCompanyInput } from "@/core/domain/companies/types";
import { CompaniesApiError, updateCompany } from "@/infrastructure/http/companies-api";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { showError, showSuccess } from "@/shared/lib/alerts";
import {
  CompanyProfileFields,
  type CompanyProfileFormValues,
} from "@/presentation/components/admin/companies/company-profile-fields";

interface CompanyEditFormProps {
  company: CompanyDetail;
  onUpdated: (company: CompanyDetail) => void;
}

function toFormValues(company: CompanyDetail): CompanyProfileFormValues {
  return {
    name: company.name,
    rfc: company.rfc ?? "",
    employerRepresentative: company.employerRepresentative ?? "",
    workersRepresentative: company.workersRepresentative ?? "",
    workersCount: company.workersCount != null ? String(company.workersCount) : "",
  };
}

export function CompanyEditForm({ company, onUpdated }: CompanyEditFormProps) {
  const [values, setValues] = useState<CompanyProfileFormValues>(() => toFormValues(company));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CompanyProfileFormValues, string>>
  >({});

  useEffect(() => {
    setValues(toFormValues(company));
  }, [company]);

  function updateField<K extends keyof CompanyProfileFormValues>(
    field: K,
    value: CompanyProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const token = authStorage.getToken();
    if (!token) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const payload: UpdateCompanyInput = {
      name: values.name.trim(),
      rfc: values.rfc.trim() || null,
      employerRepresentative: values.employerRepresentative.trim() || null,
      workersRepresentative: values.workersRepresentative.trim() || null,
      workersCount: values.workersCount ? Number(values.workersCount) : null,
    };

    try {
      const { company: updated } = await updateCompany(token, company.id, payload);
      onUpdated(updated);
      showSuccess("Empresa actualizada");
    } catch (err) {
      if (err instanceof CompaniesApiError && err.fields.length > 0) {
        const next: Partial<Record<keyof CompanyProfileFormValues, string>> = {};
        for (const f of err.fields) {
          if (f.field in values) next[f.field as keyof CompanyProfileFormValues] = f.message;
        }
        setFieldErrors(next);
      }
      showError(err instanceof CompaniesApiError ? err.message : "No se pudo actualizar la empresa");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CompanyProfileFields values={values} onChange={updateField} errors={fieldErrors} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
        <p className="text-xs text-brand-muted">
          Última actualización: {new Date(company.updatedAt).toLocaleDateString("es-MX")}
        </p>
      </div>
    </form>
  );
}
