"use client";

export interface CompanyProfileFormValues {
  name: string;
  rfc: string;
  employerRepresentative: string;
  workersRepresentative: string;
  workersCount: string;
}

interface CompanyProfileFieldsProps {
  values: CompanyProfileFormValues;
  onChange: <K extends keyof CompanyProfileFormValues>(
    field: K,
    value: CompanyProfileFormValues[K],
  ) => void;
  disabled?: boolean;
  /** Errores por campo devueltos por el back. */
  errors?: Partial<Record<keyof CompanyProfileFormValues, string>>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-700">{message}</p>;
}

export function CompanyProfileFields({
  values,
  onChange,
  disabled = false,
  errors = {},
}: CompanyProfileFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Nombre o razón social *
        </label>
        <input
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={disabled}
          required
          placeholder="Ej. Gestiona Capital Humano S.A. de C.V."
          className={`w-full rounded-lg border ${errors.name ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light`}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">RFC</label>
        <input
          value={values.rfc}
          onChange={(e) => onChange("rfc", e.target.value.toUpperCase())}
          disabled={disabled}
          maxLength={13}
          placeholder="Ej. GCH010101ABC"
          className={`w-full rounded-lg border ${errors.rfc ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm uppercase outline-none focus:border-brand-blue disabled:bg-brand-light`}
        />
        <FieldError message={errors.rfc} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Patrón o representante
        </label>
        <input
          value={values.employerRepresentative}
          onChange={(e) => onChange("employerRepresentative", e.target.value)}
          disabled={disabled}
          placeholder="Nombre del patrón o representante legal"
          className={`w-full rounded-lg border ${errors.employerRepresentative ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light`}
        />
        <FieldError message={errors.employerRepresentative} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Representante de los trabajadores
        </label>
        <input
          value={values.workersRepresentative}
          onChange={(e) => onChange("workersRepresentative", e.target.value)}
          disabled={disabled}
          placeholder="Nombre del representante sindical o de trabajadores"
          className={`w-full rounded-lg border ${errors.workersRepresentative ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light`}
        />
        <FieldError message={errors.workersRepresentative} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Número de trabajadores
        </label>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={values.workersCount}
          onChange={(e) => onChange("workersCount", e.target.value.replace(/[^0-9]/g, ""))}
          disabled={disabled}
          placeholder="Ej. 35"
          className={`w-full rounded-lg border ${errors.workersCount ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light`}
        />
        <FieldError message={errors.workersCount} />
      </div>
    </div>
  );
}

/** Misma información que los campos de Datos generales, solo para mostrar (portal de empresa). */
export function CompanyProfileReadOnly({ values }: { values: CompanyProfileFormValues }) {
  const rows: { label: string; value: string; wide?: boolean; mono?: boolean }[] = [
    { label: "Nombre o razón social", value: values.name, wide: true },
    { label: "RFC", value: values.rfc, mono: true },
    { label: "Patrón o representante", value: values.employerRepresentative },
    { label: "Representante de los trabajadores", value: values.workersRepresentative },
    { label: "Número de trabajadores", value: values.workersCount },
  ];
  return (
    <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className={r.wide ? "md:col-span-2" : undefined}>
          <dt className="mb-1.5 text-sm font-medium text-brand-muted">{r.label}</dt>
          <dd className={`text-sm font-medium text-brand-gray ${r.mono ? "uppercase" : ""}`}>
            {r.value?.trim() ? r.value : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
