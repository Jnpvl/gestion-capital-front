"use client";

import { useState } from "react";
import type { CreateCompanyInput } from "@/core/domain/companies/types";
import { CompaniesApiError } from "@/infrastructure/http/companies-api";
import { showError } from "@/shared/lib/alerts";
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
};

export function CreateCompanyForm({ onSubmit, onCancel }: CreateCompanyFormProps) {
  const [values, setValues] = useState<CompanyProfileFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof CompanyProfileFormValues>(
    field: K,
    value: CompanyProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: values.name.trim(),
        rfc: values.rfc.trim() || null,
        employerRepresentative: values.employerRepresentative.trim() || null,
        workersRepresentative: values.workersRepresentative.trim() || null,
      });
    } catch (err) {
      showError(err instanceof CompaniesApiError ? err.message : "No se pudo crear la empresa");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CompanyProfileFields values={values} onChange={updateField} />

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
