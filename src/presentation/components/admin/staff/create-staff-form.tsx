"use client";

import { useState } from "react";
import type { CreateStaffInput, StaffDetail } from "@/core/domain/staff/types";
import { StaffApiError } from "@/infrastructure/http/staff-api";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { UploadApiError, uploadStaffSignature } from "@/infrastructure/http/uploads-api";
import { showError, showUploadError } from "@/shared/lib/alerts";
import { validateUploadFile } from "@/shared/lib/upload-validation";
import { generatePassword, PasswordField } from "@/presentation/components/ui/password-field";
import { StaffPendingSignatureField } from "@/presentation/components/admin/staff/staff-media-upload";
import {
  StaffProfileFields,
  type StaffProfileFormValues,
} from "@/presentation/components/admin/staff/staff-profile-fields";

interface CreateStaffFormProps {
  onSubmit: (input: CreateStaffInput) => Promise<{ staff: StaffDetail }>;
  onCreated: (input: Pick<CreateStaffInput, "email" | "password">) => Promise<void>;
  onCancel: () => void;
}

const initialValues: StaffProfileFormValues = {
  paternalLastName: "",
  maternalLastName: "",
  firstNames: "",
  email: "",
  role: "teacher",
  age: "",
  gender: "",
  aceStpsRegistration: "",
  renapConocer: "",
  professionalLicense: "",
  photoUrl: "",
  logoUrl: "",
  signatureUrl: "",
  career: "",
  professionalArea: "",
  professionalBio: "",
};

export function CreateStaffForm({ onSubmit, onCreated, onCancel }: CreateStaffFormProps) {
  const [values, setValues] = useState<StaffProfileFormValues>(initialValues);
  const [password, setPassword] = useState(generatePassword());
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof StaffProfileFormValues>(
    field: K,
    value: StaffProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (values.role === "teacher" && !signatureFile) {
        showError("Sube la firma del instructor para continuar");
        return;
      }

      const created = await onSubmit({
        paternalLastName: values.paternalLastName.trim(),
        maternalLastName: values.maternalLastName.trim() || null,
        firstNames: values.firstNames.trim(),
        email: values.email.trim(),
        password,
        role: values.role,
        age: values.age ? Number(values.age) : null,
        gender: values.gender || null,
        aceStpsRegistration: values.aceStpsRegistration.trim() || null,
        renapConocer: values.renapConocer.trim() || null,
        professionalLicense: values.professionalLicense.trim() || null,
        photoUrl: values.photoUrl.trim() || null,
        logoUrl: values.logoUrl.trim() || null,
        career: values.career.trim() || null,
        professionalArea: values.professionalArea.trim() || null,
        professionalBio: values.professionalBio.trim() || null,
        active: true,
      });

      if (signatureFile) {
        const token = authStorage.getToken();
        if (token) {
          await uploadStaffSignature(token, created.staff.id, signatureFile);
        }
      }

      await onCreated({
        email: values.email.trim(),
        password,
      });
    } catch (err) {
      if (err instanceof UploadApiError) {
        showUploadError(err.message);
      } else {
        showError(
          err instanceof StaffApiError ? err.message : "No se pudo crear el instructor",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StaffProfileFields values={values} onChange={updateField} />

      {values.role === "teacher" ? (
        <StaffPendingSignatureField
          file={signatureFile}
          onChange={(file) => {
            if (!file) {
              setSignatureFile(null);
              return;
            }
            const validationError = validateUploadFile(file, "image");
            if (validationError) {
              showUploadError(validationError);
              return;
            }
            setSignatureFile(file);
          }}
          required
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-sm font-medium text-brand-gray">
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
          {isSubmitting ? "Creando..." : "Crear instructor"}
        </button>
      </div>
    </form>
  );
}
