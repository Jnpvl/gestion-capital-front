"use client";

import type {
  AlumnoGender,
  EducationLevel,
  JobType,
} from "@/core/domain/students/alumno-profile-options";
import {
  EDUCATION_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "@/core/domain/students/alumno-profile-options";
import { CompanySelectField } from "@/presentation/components/admin/students/company-select-field";
import { StpsCatalogField } from "@/presentation/components/admin/students/stps-catalog-field";

export interface AlumnoProfileFormValues {
  paternalLastName: string;
  maternalLastName: string;
  firstNames: string;
  curp: string;
  gender: AlumnoGender | "";
  age: string;
  email: string;
  phone: string;
  residenceLocation: string;
  educationLevel: EducationLevel | "";
  professionArea: string;
  educationInstitution: string;
  currentlyEmployed: "" | "yes" | "no";
  jobType: JobType | "";
  currentPosition: string;
  industrySector: string;
  yearsExperience: string;
  timeInCurrentPosition: string;
  companyId: string | null;
  companyName: string;
  companyRfc: string;
  stpsOccupationCode: string;
  stpsOccupationLabel: string;
  notes: string;
}

interface AlumnoProfileFieldsProps {
  values: AlumnoProfileFormValues;
  onChange: <K extends keyof AlumnoProfileFormValues>(
    field: K,
    value: AlumnoProfileFormValues[K],
  ) => void;
  showNotes?: boolean;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-brand-line bg-white p-5">
      <div>
        <h3 className="font-display text-base font-bold text-brand-gray">{title}</h3>
        {description && <p className="mt-1 text-sm text-brand-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue";

export function AlumnoProfileFields({
  values,
  onChange,
  showNotes = true,
}: AlumnoProfileFieldsProps) {
  const showLaborDetails = values.currentlyEmployed === "yes";

  function setCurrentlyEmployed(next: "" | "yes" | "no") {
    onChange("currentlyEmployed", next);
    if (next !== "yes") {
      onChange("jobType", "");
      onChange("currentPosition", "");
      onChange("industrySector", "");
      onChange("yearsExperience", "");
      onChange("timeInCurrentPosition", "");
      onChange("companyId", null);
      onChange("companyName", "");
      onChange("companyRfc", "");
      onChange("stpsOccupationCode", "");
      onChange("stpsOccupationLabel", "");
    }
  }

  return (
    <div className="space-y-6">
      <Section
        title="Datos personales"
        description="Campos obligatorios para registrar al alumno."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Apellido paterno *
            </label>
            <input
              value={values.paternalLastName}
              onChange={(e) => onChange("paternalLastName", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Apellido materno
            </label>
            <input
              value={values.maternalLastName}
              onChange={(e) => onChange("maternalLastName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Nombre(s) *</label>
            <input
              value={values.firstNames}
              onChange={(e) => onChange("firstNames", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">CURP *</label>
            <input
              value={values.curp}
              onChange={(e) => onChange("curp", e.target.value.toUpperCase())}
              required
              maxLength={18}
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Sexo *</label>
            <select
              value={values.gender}
              onChange={(e) => onChange("gender", e.target.value as AlumnoGender | "")}
              required
              className={inputClass}
            >
              <option value="">Selecciona...</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Edad *</label>
            <input
              type="number"
              min={1}
              max={120}
              value={values.age}
              onChange={(e) => onChange("age", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Teléfono *</label>
            <input
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Ciudad / Estado de residencia *
            </label>
            <input
              value={values.residenceLocation}
              onChange={(e) => onChange("residenceLocation", e.target.value)}
              required
              placeholder="Ej. Guaymas, Sonora"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Formación académica" description="Todos los campos son opcionales.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Nivel de estudios
            </label>
            <select
              value={values.educationLevel}
              onChange={(e) => onChange("educationLevel", e.target.value as EducationLevel | "")}
              className={inputClass}
            >
              <option value="">Sin especificar</option>
              {EDUCATION_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Profesión / área de formación
            </label>
            <input
              value={values.professionArea}
              onChange={(e) => onChange("professionArea", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Institución educativa de procedencia
            </label>
            <input
              value={values.educationInstitution}
              onChange={(e) => onChange("educationInstitution", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Información laboral" description="Todos los campos son opcionales.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={showLaborDetails ? "" : "sm:col-span-2"}>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              ¿Actualmente trabaja?
            </label>
            <select
              value={values.currentlyEmployed}
              onChange={(e) => setCurrentlyEmployed(e.target.value as "" | "yes" | "no")}
              className={inputClass}
            >
              <option value="">Sin especificar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          {showLaborDetails && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                  Tipo de puesto
                </label>
                <select
                  value={values.jobType}
                  onChange={(e) => onChange("jobType", e.target.value as JobType | "")}
                  className={inputClass}
                >
                  <option value="">Sin especificar</option>
                  {JOB_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <CompanySelectField
                  value={values.companyId}
                  selectedLabel={values.companyName}
                  selectedRfc={values.companyRfc}
                  onChange={(id, company) => {
                    onChange("companyId", id);
                    onChange("companyName", company?.name ?? "");
                    onChange("companyRfc", company?.rfc ?? "");
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <StpsCatalogField
                  kind="occupation"
                  value={values.stpsOccupationCode}
                  selectedLabel={values.stpsOccupationLabel}
                  onChange={(code, label) => {
                    onChange("stpsOccupationCode", code);
                    onChange("stpsOccupationLabel", label);
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                  Puesto actual
                </label>
                <input
                  value={values.currentPosition}
                  onChange={(e) => onChange("currentPosition", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                  Sector / giro de la empresa
                </label>
                <input
                  value={values.industrySector}
                  onChange={(e) => onChange("industrySector", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                  Años de experiencia laboral
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={values.yearsExperience}
                  onChange={(e) => onChange("yearsExperience", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                  Tiempo en el puesto actual
                </label>
                <input
                  value={values.timeInCurrentPosition}
                  onChange={(e) => onChange("timeInCurrentPosition", e.target.value)}
                  placeholder="Ej. 2 años, 6 meses"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      </Section>

      {showNotes && (
        <Section title="Notas internas">
          <textarea
            value={values.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            rows={3}
            placeholder="Ej. Solicitó info por WhatsApp, curso de interés..."
            className={`${inputClass} resize-y`}
          />
        </Section>
      )}
    </div>
  );
}

export function emptyAlumnoProfileValues(): AlumnoProfileFormValues {
  return {
    paternalLastName: "",
    maternalLastName: "",
    firstNames: "",
    curp: "",
    gender: "",
    age: "",
    email: "",
    phone: "",
    residenceLocation: "",
    educationLevel: "",
    professionArea: "",
    educationInstitution: "",
    currentlyEmployed: "",
    jobType: "",
    currentPosition: "",
    industrySector: "",
    yearsExperience: "",
    timeInCurrentPosition: "",
    companyId: null,
    companyName: "",
    companyRfc: "",
    stpsOccupationCode: "",
    stpsOccupationLabel: "",
    notes: "",
  };
}

export function profileValuesFromStudent(student: {
  paternalLastName: string;
  maternalLastName: string | null;
  firstNames: string;
  name: string;
  curp: string | null;
  gender: AlumnoGender | null;
  age: number | null;
  email: string;
  phone: string | null;
  residenceLocation: string | null;
  educationLevel: EducationLevel | null;
  professionArea: string | null;
  educationInstitution: string | null;
  currentlyEmployed: boolean | null;
  jobType: JobType | null;
  currentPosition: string | null;
  industrySector: string | null;
  yearsExperience: number | null;
  timeInCurrentPosition: string | null;
  companyId: string | null;
  companyName: string | null;
  companyRfc: string | null;
  stpsOccupationCode: string | null;
  stpsOccupationName: string | null;
  notes: string | null;
}): AlumnoProfileFormValues {
  const paternalLastName =
    student.paternalLastName && student.paternalLastName !== "—"
      ? student.paternalLastName
      : "";
  const firstNames = student.firstNames || student.name;

  return {
    paternalLastName,
    maternalLastName: student.maternalLastName ?? "",
    firstNames,
    curp: student.curp ?? "",
    gender: student.gender ?? "",
    age: student.age ? String(student.age) : "",
    email: student.email,
    phone: student.phone ?? "",
    residenceLocation: student.residenceLocation ?? "",
    educationLevel: student.educationLevel ?? "",
    professionArea: student.professionArea ?? "",
    educationInstitution: student.educationInstitution ?? "",
    currentlyEmployed:
      student.currentlyEmployed === null
        ? ""
        : student.currentlyEmployed
          ? "yes"
          : "no",
    jobType: student.jobType ?? "",
    currentPosition: student.currentPosition ?? "",
    industrySector: student.industrySector ?? "",
    yearsExperience: student.yearsExperience != null ? String(student.yearsExperience) : "",
    timeInCurrentPosition: student.timeInCurrentPosition ?? "",
    companyId: student.currentlyEmployed ? student.companyId : null,
    companyName: student.currentlyEmployed ? (student.companyName ?? "") : "",
    companyRfc: student.currentlyEmployed ? (student.companyRfc ?? "") : "",
    stpsOccupationCode: student.currentlyEmployed ? (student.stpsOccupationCode ?? "") : "",
    stpsOccupationLabel:
      student.currentlyEmployed && student.stpsOccupationCode && student.stpsOccupationName
        ? `${student.stpsOccupationCode} — ${student.stpsOccupationName}`
        : "",
    notes: student.notes ?? "",
  };
}

export function profileValuesToPayload(values: AlumnoProfileFormValues) {
  const currentlyEmployed =
    values.currentlyEmployed === "" ? null : values.currentlyEmployed === "yes";
  const employed = currentlyEmployed === true;

  return {
    paternalLastName: values.paternalLastName.trim(),
    maternalLastName: values.maternalLastName.trim() || null,
    firstNames: values.firstNames.trim(),
    curp: values.curp.trim().toUpperCase(),
    gender: values.gender as AlumnoGender,
    age: Number(values.age),
    email: values.email.trim(),
    phone: values.phone.trim(),
    residenceLocation: values.residenceLocation.trim(),
    educationLevel: values.educationLevel || null,
    professionArea: values.professionArea.trim() || null,
    educationInstitution: values.educationInstitution.trim() || null,
    currentlyEmployed,
    jobType: employed ? values.jobType || null : null,
    currentPosition: employed ? values.currentPosition.trim() || null : null,
    industrySector: employed ? values.industrySector.trim() || null : null,
    yearsExperience: employed && values.yearsExperience ? Number(values.yearsExperience) : null,
    timeInCurrentPosition: employed ? values.timeInCurrentPosition.trim() || null : null,
    companyId: employed ? values.companyId : null,
    stpsOccupationCode: employed ? values.stpsOccupationCode || null : null,
    notes: values.notes.trim() || null,
  };
}
