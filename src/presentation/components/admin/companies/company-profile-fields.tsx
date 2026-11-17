"use client";

export interface CompanyProfileFormValues {
  name: string;
  rfc: string;
  employerRepresentative: string;
  workersRepresentative: string;
  workersCount: string;
  activityMain: string;
  address: string;
  addressStreet: string;
  addressExteriorNumber: string;
  addressInteriorNumber: string;
  addressNeighborhood: string;
  addressPostalCode: string;
  addressCity: string;
  addressMunicipality: string;
  addressState: string;
  addressCountry: string;
  addressBetweenStreet1: string;
  addressBetweenStreet2: string;
}

const ADDRESS_FIELDS = [
  { key: "addressStreet", label: "Calle", maxLength: 150 },
  { key: "addressExteriorNumber", label: "Número exterior", maxLength: 30 },
  { key: "addressInteriorNumber", label: "Número interior", maxLength: 30 },
  { key: "addressNeighborhood", label: "Colonia", maxLength: 150 },
  { key: "addressPostalCode", label: "Código postal", maxLength: 5 },
  { key: "addressCity", label: "Ciudad o localidad", maxLength: 100 },
  { key: "addressMunicipality", label: "Municipio o alcaldía", maxLength: 100 },
  { key: "addressState", label: "Estado", maxLength: 100 },
  { key: "addressCountry", label: "País", maxLength: 100 },
  { key: "addressBetweenStreet1", label: "Entre calle", maxLength: 150 },
  { key: "addressBetweenStreet2", label: "Y calle", maxLength: 150 },
] as const;

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

type ProfileField = {
  key: keyof CompanyProfileFormValues;
  label: string;
  maxLength?: number;
  wide?: boolean;
  placeholder?: string;
};

const PROFILE_SECTIONS: { title: string; fields: ProfileField[] }[] = [
  { title: "Información general", fields: [
    { key: "name", label: "Nombre o razón social", wide: true },
    { key: "rfc", label: "RFC", maxLength: 13 },
    { key: "activityMain", label: "Actividad principal", maxLength: 100 },
  ] },
  { title: "Representantes y trabajadores", fields: [
    { key: "employerRepresentative", label: "Patrón o representante" },
    { key: "workersRepresentative", label: "Representante de los trabajadores" },
    { key: "workersCount", label: "Número de trabajadores" },
  ] },
  { title: "Domicilio", fields: ADDRESS_FIELDS.map(field => ({
    ...field,
    wide: field.key === "addressStreet",
    placeholder: field.key === "addressExteriorNumber" ? "Ej. 123 o S/N" : undefined,
  })) },
];

export function CompanyProfileFields({ values, onChange, disabled = false, errors = {} }: CompanyProfileFieldsProps) {
  return (
    <div className="space-y-6">
      {PROFILE_SECTIONS.map(section => (
        <section key={section.title} className="rounded-xl border border-brand-line p-4 sm:p-5">
          <h3 className="mb-5 font-display text-base font-bold text-brand-gray">{section.title}</h3>
          <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
            {section.fields.map(({ key, label, maxLength, wide, placeholder }) => (
              <div key={key} className={wide ? "min-w-0 md:col-span-2" : "min-w-0"}>
                <label htmlFor={`company-${key}`} className="mb-1.5 block text-sm font-medium text-brand-gray">
                  {label}{key === "name" ? " *" : ""}
                </label>
                <input id={`company-${key}`} value={values[key]} disabled={disabled}
                  required={key === "name"} maxLength={maxLength} placeholder={placeholder}
                  type={key === "workersCount" ? "number" : "text"}
                  min={key === "workersCount" ? 1 : undefined}
                  inputMode={key === "addressPostalCode" || key === "workersCount" ? "numeric" : undefined}
                  pattern={key === "addressPostalCode" ? "[0-9]{5}" : undefined}
                  onChange={event => onChange(key, key === "rfc" ? event.target.value.toUpperCase() : key === "workersCount" ? event.target.value.replace(/[^0-9]/g, "") : event.target.value)}
                  className={`w-full rounded-lg border ${errors[key] ? "border-red-500" : "border-brand-line"} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light`} />
                <FieldError message={errors[key]} />
              </div>
            ))}
            {section.title === "Domicilio" && values.address && (
              <div className="md:col-span-2">
                <label htmlFor="company-address" className="mb-1.5 block text-sm font-medium text-brand-gray">Domicilio capturado anteriormente</label>
                <textarea id="company-address" value={values.address} disabled={disabled} maxLength={500} rows={2}
                  onChange={event => onChange("address", event.target.value)}
                  className="w-full resize-y rounded-lg border border-brand-line px-4 py-2.5 text-sm" />
                <FieldError message={errors.address} />
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CompanyProfileReadOnly({ values }: { values: CompanyProfileFormValues }) {
  return (
    <div className="space-y-6">
      {PROFILE_SECTIONS.map(section => (
        <section key={section.title} className="rounded-xl border border-brand-line p-4 sm:p-5">
          <h3 className="mb-5 font-display text-base font-bold text-brand-gray">{section.title}</h3>
          <dl className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            {section.fields.map(({ key, label, wide }) => (
              <div key={key} className={wide ? "min-w-0 md:col-span-2" : "min-w-0"}>
                <dt className="mb-1 text-xs text-brand-muted">{label}</dt>
                <dd className="whitespace-pre-line break-words text-sm font-medium text-brand-gray">{values[key]?.trim() || "—"}</dd>
              </div>
            ))}
            {section.title === "Domicilio" && values.address && (
              <div className="md:col-span-2">
                <dt className="mb-1 text-xs text-brand-muted">Domicilio capturado anteriormente</dt>
                <dd className="whitespace-pre-line break-words text-sm font-medium text-brand-gray">{values.address}</dd>
              </div>
            )}
          </dl>
        </section>
      ))}
    </div>
  );
}
