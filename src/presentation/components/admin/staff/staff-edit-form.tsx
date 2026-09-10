"use client";

import { useEffect, useState } from "react";
import type { StaffDetail, UpdateStaffInput } from "@/core/domain/staff/types";
import { StaffApiError, updateStaff } from "@/infrastructure/http/staff-api";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { showError, showSaved } from "@/shared/lib/alerts";
import {
  StaffProfileFields,
  type StaffProfileFormValues,
} from "@/presentation/components/admin/staff/staff-profile-fields";

interface StaffEditFormProps {
  staff: StaffDetail;
  onUpdated: (staff: StaffDetail) => void;
}

function toFormValues(staff: StaffDetail): StaffProfileFormValues {
  return {
    paternalLastName: staff.paternalLastName,
    maternalLastName: staff.maternalLastName ?? "",
    firstNames: staff.firstNames,
    email: staff.email,
    role: staff.role,
    age: staff.age ? String(staff.age) : "",
    gender: staff.gender ?? "",
    aceStpsRegistration: staff.aceStpsRegistration ?? "",
    renapConocer: staff.renapConocer ?? "",
    professionalLicense: staff.professionalLicense ?? "",
    photoUrl: staff.photoUrl ?? "",
    logoUrl: staff.logoUrl ?? "",
    signatureUrl: staff.signatureUrl ?? "",
    career: staff.career ?? "",
    professionalArea: staff.professionalArea ?? "",
    professionalBio: staff.professionalBio ?? "",
  };
}

export function StaffEditForm({ staff, onUpdated }: StaffEditFormProps) {
  const [values, setValues] = useState<StaffProfileFormValues>(() => toFormValues(staff));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(toFormValues(staff));
  }, [staff]);

  function updateField<K extends keyof StaffProfileFormValues>(
    field: K,
    value: StaffProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const token = authStorage.getToken();
    if (!token) return;

    const payload: UpdateStaffInput = {
      paternalLastName: values.paternalLastName.trim(),
      maternalLastName: values.maternalLastName.trim() || null,
      firstNames: values.firstNames.trim(),
      email: values.email.trim(),
      role: values.role,
      age: values.age ? Number(values.age) : null,
      gender: values.gender || null,
      aceStpsRegistration: values.aceStpsRegistration.trim() || null,
      renapConocer: values.renapConocer.trim() || null,
      professionalLicense: values.professionalLicense.trim() || null,
      photoUrl: values.photoUrl.trim() || null,
      logoUrl: values.logoUrl.trim() || null,
      signatureUrl: values.signatureUrl.trim() || null,
      career: values.career.trim() || null,
      professionalArea: values.professionalArea.trim() || null,
      professionalBio: values.professionalBio.trim() || null,
    };

    setIsSaving(true);

    try {
      const { staff: updated } = await updateStaff(token, staff.id, payload);
      onUpdated(updated);
      showSaved();
    } catch (err) {
      showError(err instanceof StaffApiError ? err.message : "No se pudo guardar el instructor");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <StaffProfileFields
        values={values}
        onChange={updateField}
        staffId={staff.id}
      />

      <div className="flex items-center justify-between gap-3 border-t border-brand-line pt-4">
        <p className="text-xs text-brand-muted">
          Registrado: {new Date(staff.createdAt).toLocaleDateString("es-MX")}
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
