"use client";

import { useEffect, useMemo } from "react";
import {
  DEMOGRAPHIC_FILTER_ALL,
  demographicFilterOptions,
  demographicSelectionIds,
} from "@/shared/lib/dashboard-demographic-filters";
import type { DashboardDemographics, DashboardEmployee } from "@/core/domain/forms/types";

export function CompanyDashboardDemographicFilters({
  demographics,
  employees,
  departamento,
  puesto,
  onDepartamentoChange,
  onPuestoChange,
  embedded = false,
  description = "Filtra resultados y gráficas por departamento o puesto. Al elegir uno, el otro se ajusta a las opciones disponibles.",
}: {
  demographics: DashboardDemographics | undefined;
  employees: DashboardEmployee[];
  departamento: string;
  puesto: string;
  onDepartamentoChange: (value: string) => void;
  onPuestoChange: (value: string) => void;
  description?: string;
  embedded?: boolean;
}) {
  const allDeptOptions = useMemo(
    () => demographicFilterOptions(demographics, employees, "departamento"),
    [demographics, employees],
  );
  const allPuestoOptions = useMemo(
    () => demographicFilterOptions(demographics, employees, "puesto"),
    [demographics, employees],
  );
  const deptOptions = useMemo(() => {
    const scope = demographicSelectionIds(demographics, employees, "puesto", puesto);
    return demographicFilterOptions(demographics, employees, "departamento", scope);
  }, [demographics, employees, puesto]);
  const puestoOptions = useMemo(() => {
    const scope = demographicSelectionIds(demographics, employees, "departamento", departamento);
    return demographicFilterOptions(demographics, employees, "puesto", scope);
  }, [demographics, employees, departamento]);

  const deptValues = useMemo(
    () => new Set(deptOptions.map((option) => option.value)),
    [deptOptions],
  );
  const puestoValues = useMemo(
    () => new Set(puestoOptions.map((option) => option.value)),
    [puestoOptions],
  );

  useEffect(() => {
    if (departamento && !deptValues.has(departamento)) {
      onDepartamentoChange(DEMOGRAPHIC_FILTER_ALL);
    }
  }, [departamento, deptValues, onDepartamentoChange]);

  useEffect(() => {
    if (puesto && !puestoValues.has(puesto)) {
      onPuestoChange(DEMOGRAPHIC_FILTER_ALL);
    }
  }, [puesto, puestoValues, onPuestoChange]);

  if (allDeptOptions.length === 0 && allPuestoOptions.length === 0) return null;

  const active = Boolean(departamento || puesto);

  return (
    <div className={embedded ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3 rounded-2xl border border-brand-line bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"}>
      {!embedded && <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Filtros Guía V</p>
        <p className="mt-1 text-sm text-brand-muted">
          {description}
        </p>
      </div>}
      {allDeptOptions.length > 0 && (
        <FilterSelect
          id="dashboard-filter-departamento"
          label="Departamento"
          value={departamento}
          options={deptOptions}
          onChange={onDepartamentoChange}
        />
      )}
      {allPuestoOptions.length > 0 && (
        <FilterSelect
          id="dashboard-filter-puesto"
          label="Puesto"
          value={puesto}
          options={puestoOptions}
          onChange={onPuestoChange}
        />
      )}
      {active && !embedded && (
        <button
          type="button"
          onClick={() => {
            onDepartamentoChange(DEMOGRAPHIC_FILTER_ALL);
            onPuestoChange(DEMOGRAPHIC_FILTER_ALL);
          }}
          className="rounded-xl border border-brand-line px-4 py-2.5 text-sm font-semibold text-brand-gray hover:bg-brand-light"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string; count: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0 sm:min-w-44 sm:flex-1">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-gray outline-none focus:border-brand-blue"
      >
        <option value={DEMOGRAPHIC_FILTER_ALL}>Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}
