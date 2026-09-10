"use client";

import type { StaffRole } from "@/core/domain/auth/types";
import type { StaffGender } from "@/core/domain/staff/types";
import { STAFF_GENDER_LABELS } from "@/core/domain/staff/types";
import { StaffMediaUpload } from "@/presentation/components/admin/staff/staff-media-upload";
import { cn } from "@/shared/lib/cn";

export interface StaffProfileFormValues {
  paternalLastName: string;
  maternalLastName: string;
  firstNames: string;
  email: string;
  role: StaffRole;
  age: string;
  gender: StaffGender | "";
  aceStpsRegistration: string;
  renapConocer: string;
  professionalLicense: string;
  photoUrl: string;
  logoUrl: string;
  signatureUrl: string;
  career: string;
  professionalArea: string;
  professionalBio: string;
}

interface StaffProfileFieldsProps {
  values: StaffProfileFormValues;
  onChange: <K extends keyof StaffProfileFormValues>(
    field: K,
    value: StaffProfileFormValues[K],
  ) => void;
  staffId?: string;
  showEmail?: boolean;
  showRole?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-brand-gray">
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  );
}

export function StaffProfileFields({
  values,
  onChange,
  staffId,
  showEmail = true,
  showRole = true,
}: StaffProfileFieldsProps) {
  const isTeacher = values.role === "teacher";
  const folderHint = [
    values.paternalLastName,
    values.firstNames,
  ]
    .map((part) =>
      part
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "instructor";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <Field label="Apellido paterno" required className="lg:col-span-3">
          <input
            value={values.paternalLastName}
            onChange={(e) => onChange("paternalLastName", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Apellido materno" className="lg:col-span-3">
          <input
            value={values.maternalLastName}
            onChange={(e) => onChange("maternalLastName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Nombre(s)" required className="sm:col-span-2 lg:col-span-6">
          <input
            value={values.firstNames}
            onChange={(e) => onChange("firstNames", e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        {showEmail && (
          <Field label="Correo" required className="sm:col-span-2 lg:col-span-5">
            <input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
              className={inputClass}
            />
          </Field>
        )}

        {showRole && (
          <Field label="Rol" required className="lg:col-span-3">
            <select
              value={values.role}
              onChange={(e) => onChange("role", e.target.value as StaffRole)}
              className={inputClass}
            >
              <option value="teacher">Instructor</option>
              <option value="admin">Administrador</option>
            </select>
          </Field>
        )}

        <Field label="Edad" className="lg:col-span-2">
          <input
            type="number"
            min={16}
            max={120}
            value={values.age}
            onChange={(e) => onChange("age", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Sexo" className="lg:col-span-2">
          <select
            value={values.gender}
            onChange={(e) => onChange("gender", e.target.value as StaffGender | "")}
            className={inputClass}
          >
            <option value="">Sin especificar</option>
            {(Object.keys(STAFF_GENDER_LABELS) as StaffGender[]).map((key) => (
              <option key={key} value={key}>
                {STAFF_GENDER_LABELS[key]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 lg:p-5">
        <p className="text-sm font-medium text-brand-gray">
          Perfil de capacitador {isTeacher ? "*" : "(opcional para administradores)"}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <Field
            label={`Registro ACE STPS${isTeacher ? " *" : ""}`}
            className="sm:col-span-2 lg:col-span-4"
          >
            <input
              value={values.aceStpsRegistration}
              onChange={(e) => onChange("aceStpsRegistration", e.target.value)}
              required={isTeacher}
              className={cn(inputClass, "bg-white")}
            />
          </Field>
          <Field label="RENAP / CONOCER" className="sm:col-span-2 lg:col-span-4">
            <input
              value={values.renapConocer}
              onChange={(e) => onChange("renapConocer", e.target.value)}
              placeholder="Registrar cuando aplique"
              className={cn(inputClass, "bg-white")}
            />
          </Field>
          <Field label="Cédula profesional" className="lg:col-span-4">
            <input
              value={values.professionalLicense}
              onChange={(e) => onChange("professionalLicense", e.target.value)}
              className={cn(inputClass, "bg-white")}
            />
          </Field>

          <Field
            label={`Carrera / profesión${isTeacher ? " *" : ""}`}
            className="sm:col-span-2 lg:col-span-6"
          >
            <input
              value={values.career}
              onChange={(e) => onChange("career", e.target.value)}
              required={isTeacher}
              className={cn(inputClass, "bg-white")}
            />
          </Field>
          <Field
            label={`Área en la que se desarrolla${isTeacher ? " *" : ""}`}
            className="sm:col-span-2 lg:col-span-6"
          >
            <input
              value={values.professionalArea}
              onChange={(e) => onChange("professionalArea", e.target.value)}
              required={isTeacher}
              className={cn(inputClass, "bg-white")}
            />
          </Field>

          <Field label="Perfil profesional" className="sm:col-span-2 lg:col-span-12">
            <textarea
              value={values.professionalBio}
              onChange={(e) => onChange("professionalBio", e.target.value)}
              rows={3}
              placeholder="Breve descripción del instructor..."
              className={cn(inputClass, "resize-y bg-white")}
            />
          </Field>
        </div>

        {staffId ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StaffMediaUpload
              kind="photo"
              staffId={staffId}
              folderHint={`${folderHint}-${staffId.replaceAll("-", "").slice(0, 8)}`}
              value={values.photoUrl || null}
              onChange={(path) => onChange("photoUrl", path)}
            />
            <StaffMediaUpload
              kind="logo"
              staffId={staffId}
              folderHint={`${folderHint}-${staffId.replaceAll("-", "").slice(0, 8)}`}
              value={values.logoUrl || null}
              onChange={(path) => onChange("logoUrl", path)}
            />
            <StaffMediaUpload
              kind="signature"
              staffId={staffId}
              folderHint={`${folderHint}-${staffId.replaceAll("-", "").slice(0, 8)}`}
              value={values.signatureUrl || null}
              onChange={(path) => onChange("signatureUrl", path)}
            />
          </div>
        ) : (
          <p className="text-xs text-brand-muted">
            La fotografía y el logo se pueden subir después de crear el perfil. La firma se pide al registrar.
          </p>
        )}
      </div>
    </div>
  );
}
