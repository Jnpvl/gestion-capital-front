"use client";

export interface CompanyProfileFormValues {
  name: string;
  rfc: string;
  employerRepresentative: string;
  workersRepresentative: string;
}

interface CompanyProfileFieldsProps {
  values: CompanyProfileFormValues;
  onChange: <K extends keyof CompanyProfileFormValues>(
    field: K,
    value: CompanyProfileFormValues[K],
  ) => void;
  disabled?: boolean;
}

export function CompanyProfileFields({ values, onChange, disabled = false }: CompanyProfileFieldsProps) {
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
          className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">RFC</label>
        <input
          value={values.rfc}
          onChange={(e) => onChange("rfc", e.target.value.toUpperCase())}
          disabled={disabled}
          maxLength={13}
          placeholder="Ej. GCH010101ABC"
          className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm uppercase outline-none focus:border-brand-blue disabled:bg-brand-light"
        />
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
          className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
        />
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
          className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
        />
      </div>
    </div>
  );
}
