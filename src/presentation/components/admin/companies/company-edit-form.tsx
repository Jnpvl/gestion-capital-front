"use client";

import { useState } from "react";
import type { CompanyDetail, UpdateCompanyInput } from "@/core/domain/companies/types";
import { CompaniesApiError, updateCompany } from "@/infrastructure/http/companies-api";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { showError, showSuccess } from "@/shared/lib/alerts";
import {
  CompanyProfileFields,
  CompanyProfileReadOnly,
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
    activityMain: company.activityMain ?? "",
    address: company.address ?? "",
    addressStreet: company.addressStreet ?? "",
    addressExteriorNumber: company.addressExteriorNumber ?? "",
    addressInteriorNumber: company.addressInteriorNumber ?? "",
    addressNeighborhood: company.addressNeighborhood ?? "",
    addressPostalCode: company.addressPostalCode ?? "",
    addressCity: company.addressCity ?? "",
    addressMunicipality: company.addressMunicipality ?? "",
    addressState: company.addressState ?? "",
    addressCountry: company.addressCountry ?? "",
    addressBetweenStreet1: company.addressBetweenStreet1 ?? "",
    addressBetweenStreet2: company.addressBetweenStreet2 ?? "",
  };
}

export function CompanyEditForm({ company, onUpdated }: CompanyEditFormProps) {
  const [values, setValues] = useState<CompanyProfileFormValues>(() => toFormValues(company));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CompanyProfileFormValues, string>>
  >({});

  const [isEditing, setIsEditing] = useState(false);

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
      activityMain: values.activityMain.trim() || null,
      address: values.address.trim() || null,
      addressStreet: values.addressStreet.trim() || null,
      addressExteriorNumber: values.addressExteriorNumber.trim() || null,
      addressInteriorNumber: values.addressInteriorNumber.trim() || null,
      addressNeighborhood: values.addressNeighborhood.trim() || null,
      addressPostalCode: values.addressPostalCode.trim() || null,
      addressCity: values.addressCity.trim() || null,
      addressMunicipality: values.addressMunicipality.trim() || null,
      addressState: values.addressState.trim() || null,
      addressCountry: values.addressCountry.trim() || null,
      addressBetweenStreet1: values.addressBetweenStreet1.trim() || null,
      addressBetweenStreet2: values.addressBetweenStreet2.trim() || null,
    };

    try {
      const { company: updated } = await updateCompany(token, company.id, payload);
      onUpdated(updated);
      setIsEditing(false);
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

  if (!isEditing) return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-brand-gray">Información de la empresa</h2>
        <button type="button" onClick={() => { setValues(toFormValues(company)); setFieldErrors({}); setIsEditing(true); }}
          className="rounded-lg border border-brand-line px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-light">Editar información</button>
      </div>
      <CompanyProfileReadOnly values={toFormValues(company)} />
      <p className="text-xs text-brand-muted">Registrada: {new Date(company.createdAt).toLocaleDateString("es-MX")} · Última actualización: {new Date(company.updatedAt).toLocaleDateString("es-MX")}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-lg font-bold text-brand-gray">Editar información de la empresa</h2>
      <CompanyProfileFields values={values} onChange={updateField} errors={fieldErrors} disabled={isSubmitting} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" disabled={isSubmitting} onClick={() => setIsEditing(false)} className="rounded-lg border border-brand-line px-5 py-2.5 text-sm font-semibold hover:bg-brand-light disabled:opacity-60">Cancelar</button>
        <p className="text-xs text-brand-muted">
          Última actualización: {new Date(company.updatedAt).toLocaleDateString("es-MX")}
        </p>
      </div>
    </form>
  );
}
