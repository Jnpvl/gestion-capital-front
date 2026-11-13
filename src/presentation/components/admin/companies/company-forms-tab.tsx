"use client";

import Link from "next/link";
import { useAuth } from "@/presentation/providers/auth-provider";
import { CompanyFormsImport } from "./company-forms-import";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FORM_MODE_HINT,
  FORM_MODE_LABEL,
  FORM_SHORT_LABEL,
  suggestionRuleLabel,
  type CompanyFormsResponse,
  type FormKey,
  type FormMode,
} from "@/core/domain/forms/types";
import {
  createFormAssignment,
  getCompanyForms,
  setCompanyFormMode,
  unassignCompanyForm,
} from "@/infrastructure/http/forms-api";
import { confirmAction, showError, showSuccess } from "@/shared/lib/alerts";

function inUseMessage(n: number) {
  return `No se puede desasignar: ${n} ${n === 1 ? "empleado ya la empezó" : "empleados ya la empezaron"}`;
}

export function CompanyFormsTab({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<CompanyFormsResponse | null>(null);
  const [selected, setSelected] = useState<FormKey[]>([]);
  const [dueAt, setDueAt] = useState("");
  const [modes, setModes] = useState<Partial<Record<FormKey, FormMode>>>({});
  const [guia3SamplingMode, setGuia3SamplingMode] = useState<"census" | "sample">("census");
  const [isSaving, setIsSaving] = useState(false);
  const loadVersion = useRef(0);

  const load = useCallback(async (evaluationYear = year) => {
    const version = ++loadVersion.current;
    try {
      const result = await getCompanyForms(companyId, evaluationYear);
      if (version !== loadVersion.current) return null;
      setData(result);
      return result;
    } catch (err) {
      if (version !== loadVersion.current) return null;
      showError(err instanceof Error ? err.message : "Error al cargar formularios");
      return null;
    }
  }, [companyId, year]);

  useEffect(() => {
    // Ya asignadas aparecen marcadas; si no hay ninguna, se proponen las sugeridas.
    let cancelled = false;
    const counter = loadVersion;
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      const r = await load(year);
      if (!cancelled && r) setSelected(r.assignedFormKeys.length ? r.assignedFormKeys : r.suggestedFormKeys);
    });
    return () => { cancelled = true; counter.current++; };
  }, [load, year]);

  if (!data) return <div className="text-sm text-brand-muted">Cargando formularios...</div>;

  const isAssigned = (key: FormKey) => data.assignedFormKeys.includes(key);
  const toggle = (key: FormKey) => {
    if (isAssigned(key)) return;
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  };
  const newKeys = selected.filter((k) => !isAssigned(k));
  const ORDER: FormKey[] = ["nom035_guia1", "nom035_guia2", "nom035_guia3"];
  const progressRows = [...data.guideProgress].sort(
    (a, b) => ORDER.indexOf(a.formKey) - ORDER.indexOf(b.formKey),
  );

  async function handleUnassign(key: FormKey) {
    const label = FORM_SHORT_LABEL[key] ?? key;
    const ok = await confirmAction({
      title: `¿Desasignar ${label}?`,
      text: `Se quitará ${label} de la evaluación ${year}. Ningún empleado la ha empezado, así que no se pierden respuestas.`,
      confirmText: "Sí, desasignar",
    });
    if (!ok) return;
    try {
      await unassignCompanyForm(companyId, key, year);
      const r = await load(year);
      if (r) setSelected((s) => s.filter((k) => k !== key || r.assignedFormKeys.includes(k)));
      showSuccess(`${label} desasignada (${year})`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo desasignar");
    }
  }
  async function handleModeChange(key: FormKey, mode: FormMode) {
    const label = FORM_SHORT_LABEL[key] ?? key;
    const ok = await confirmAction({
      title: `¿Cambiar el modo de ${label}?`,
      text: `Nuevo modo: «${FORM_MODE_LABEL[mode]}». ${FORM_MODE_HINT[mode]}`,
      confirmText: "Sí, cambiar",
    });
    if (!ok) return;
    try {
      await setCompanyFormMode(companyId, key, mode, year);
      await load(year);
      showSuccess(`${label}: ${FORM_MODE_LABEL[mode]}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo cambiar el modo");
    }
  }
  const modeOf = (key: FormKey) => data.guideProgress.find((g) => g.formKey === key)?.mode;
  const isSuggested = (key: FormKey) => data.suggestedFormKeys.includes(key);
  const differs =
    selected.length !== data.suggestedFormKeys.length || selected.some((k) => !isSuggested(k));

  async function handleAssign() {
    if (newKeys.length === 0) return;
    setIsSaving(true);
    try {
      const result = await createFormAssignment(companyId, {
        formKeys: newKeys,
        evaluationYear: year,
        modes: Object.fromEntries(newKeys.map((k) => [k, modes[k] ?? "admin_applied"])),
        ...(newKeys.includes("nom035_guia3") ? { guia3SamplingMode } : {}),
        dueAt: dueAt ? new Date(`${dueAt}T23:59:59`).toISOString() : null,
      });
      await load(year);
      setDueAt("");
      const sample = result.sampling;
      const sampleNote =
        sample?.mode === "sample"
          ? ` Muestreo Guía III: ${sample.sampleN} de ${sample.populationN} trabajadores.`
          : sample?.mode === "census"
            ? ` Censo Guía III: ${sample.populationN} trabajadores.`
            : "";
      showSuccess(
        `Formularios asignados para ${year}.${sampleNote} Aún no se envían correos a los empleados.`,
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo asignar");
    } finally {
      setIsSaving(false);
    }
  }

  const yearOptions = Array.from(
    new Set([
      ...(data.evaluationYears ?? []),
      year,
      currentYear - 1,
      currentYear,
      currentYear + 1,
    ]),
  ).sort((a, b) => b - a);
  const activeYear = data.evaluationYear ?? year;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-gray">Asignar formularios NOM-035</h2>
        <p className="mt-1 text-sm text-brand-muted">
          {data.workersCount != null
            ? `Número de trabajadores capturado: ${data.workersCount}.`
            : `Sin número de trabajadores capturado (se usa empleados vinculados: ${data.employeesLinked}). Captúralo en Datos generales.`}{" "}
          {suggestionRuleLabel(data.workersCount ?? (data.employeesLinked || null))}
        </p>

        <div className="mt-4">
          <label className="text-sm font-semibold text-brand-gray" htmlFor="evaluation-year">
            Año de evaluación
          </label>
          <select
            id="evaluation-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1.5 block w-full max-w-xs rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-gray"
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-brand-muted">
            Cada año guarda su propia evaluación. Cambia el año arriba para ver o asignar guías de ese periodo
            (p. ej. 2026 y 2027 pueden tener la misma Guía II por separado).
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.forms.map((form) => {
            const assigned = isAssigned(form.key);
            const checked = assigned || selected.includes(form.key);
            return (
              <label
                key={form.key}
                title={assigned ? "Ya asignada. Para quitarla usa Desasignar en la tabla de abajo." : undefined}
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
                  assigned ? "cursor-default" : "cursor-pointer"
                } ${checked ? "border-brand-black bg-brand-light/60" : "border-brand-line"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={assigned}
                  onChange={() => toggle(form.key)}
                  className="mt-0.5 h-4 w-4 accent-brand-black disabled:opacity-70"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-brand-gray">{form.title}</span>
                    {assigned && (
                      <span className="rounded-full bg-brand-black px-2 py-0.5 text-xs font-semibold text-white">
                        Asignada {activeYear}
                      </span>
                    )}
                    {isSuggested(form.key) && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Sugerida
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-brand-muted">{form.subtitle}</span>
                  {assigned ? (
                    <span className="mt-1.5 block text-xs font-medium text-brand-gray">
                      Modo: {FORM_MODE_LABEL[modeOf(form.key) ?? "admin_applied"]}
                      {form.key === "nom035_guia3" &&
                        (() => {
                          const s = data.guideProgress.find((g) => g.formKey === "nom035_guia3")
                            ?.sampling;
                          if (!s) return null;
                          return (
                            <span className="mt-1 block text-xs font-semibold text-brand-blue">
                              {s.mode === "sample"
                                ? `Muestreo · ${s.sampleN} / ${s.populationN} trabajadores`
                                : `Censo · ${s.populationN} / ${s.populationN} trabajadores`}
                            </span>
                          );
                        })()}
                    </span>
                  ) : (
                    checked && (
                      <span className="mt-2 block space-y-2" onClick={(e) => e.preventDefault()}>
                        <select
                          aria-label={`Modo de ${form.title}`}
                          value={modes[form.key] ?? "admin_applied"}
                          onChange={(e) =>
                            setModes((m) => ({ ...m, [form.key]: e.target.value as FormMode }))
                          }
                          className="w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                        >
                          {(["admin_applied", "self"] as const).map((m) => (
                            <option key={m} value={m}>
                              {FORM_MODE_LABEL[m]}
                            </option>
                          ))}
                        </select>
                        <span className="block text-xs text-brand-muted">
                          {FORM_MODE_HINT[modes[form.key] ?? "admin_applied"]}
                        </span>
                        {form.key === "nom035_guia3" && (
                          <span className="block">
                            <label className="mb-1 block text-xs font-semibold text-brand-gray">
                              Universo de aplicación
                            </label>
                            <select
                              aria-label="Censo o muestreo Guía III"
                              value={guia3SamplingMode}
                              onChange={(e) =>
                                setGuia3SamplingMode(e.target.value as "census" | "sample")
                              }
                              className="w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                            >
                              <option value="census">Censo (todos los trabajadores)</option>
                              <option value="sample">
                                Muestreo representativo (fórmula NOM-035)
                              </option>
                            </select>
                            <span className="mt-1 block text-xs text-brand-muted">
                              {guia3SamplingMode === "sample"
                                ? "Calcula n, reparte por sexo (Guía V) y marca seleccionados al azar dentro de cada grupo. Requiere Guía V con sexo."
                                : "La Guía III se asigna a todos los empleados activos."}
                            </span>
                          </span>
                        )}
                      </span>
                    )
                  )}
                  <Link
                    href={`/admin/formularios/${form.key}`}
                    className="mt-1 inline-block text-xs font-medium text-brand-blue hover:underline"
                  >
                    Vista previa
                  </Link>
                </span>
              </label>
            );
          })}
        </div>

        {differs && (
          <p className="mt-3 text-xs text-amber-700">
            La selección es distinta a la sugerida por el número de trabajadores.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Fecha límite (opcional)
            </label>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleAssign()}
            disabled={isSaving || newKeys.length === 0}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
          >
            {isSaving
              ? "Asignando..."
              : newKeys.length > 0
                ? `Asignar ${activeYear} (${newKeys.length})`
                : `Asignar ${activeYear}`}
          </button>
        </div>
        <p className="mt-3 text-xs text-brand-muted">
          Se registra la asignación del año {activeYear} para los empleados vinculados. El envío del
          enlace a cada empleado está pendiente (no se envían correos).
        </p>
      </div>

      {(user?.role === "admin" || user?.role === "super_admin") && (
        <CompanyFormsImport
          companyId={companyId}
          evaluationYears={data.evaluationYears ?? []}
          onImported={(importedYear) => {
            if (importedYear === year) void load(year);
            else setYear(importedYear);
          }}
        />
      )}

      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="border-b border-brand-line p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">
            Asignaciones {activeYear}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Solo se listan las guías del año seleccionado. Cambia el año arriba para ver 2025, 2026, 2027, etc.
          </p>
        </div>
        {progressRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-brand-muted">
            Aún no hay formularios asignados para {activeYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                  <th className="px-6 py-3.5 font-semibold">Guía</th>
                  <th className="px-4 py-3.5 font-semibold">Año</th>
                  <th className="px-4 py-3.5 font-semibold">Modo</th>
                  <th className="px-4 py-3.5 font-semibold">Asignado</th>
                  <th className="px-4 py-3.5 font-semibold">Fecha límite</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Completados</th>
                  <th className="px-4 py-3.5 text-right font-semibold">En progreso</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Pendientes</th>
                  <th className="px-6 py-3.5 font-semibold">Progreso</th>
                  <th className="px-6 py-3.5 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {progressRows.map((g) => {
                  const pct = g.employeesTotal
                    ? Math.round((g.completed / g.employeesTotal) * 100)
                    : 0;
                  return (
                    <tr key={`${activeYear}-${g.formKey}`}>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-brand-gray">
                          {FORM_SHORT_LABEL[g.formKey] ?? g.formKey}
                        </span>
                        <span className="mt-0.5 block text-xs text-brand-muted">
                          {data.forms.find((f) => f.key === g.formKey)?.subtitle ?? ""}
                        </span>
                        {g.sampling && (
                          <span className="mt-1 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200">
                            {g.sampling.mode === "sample"
                              ? `Muestreo · ${g.sampling.sampleN} / ${g.sampling.populationN}`
                              : `Censo · ${g.sampling.populationN} / ${g.sampling.populationN}`}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-gray">
                          {activeYear}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {(() => {
                          const used = data.guidesInUse[g.formKey] ?? 0;
                          return (
                            <select
                              aria-label={`Modo de ${FORM_SHORT_LABEL[g.formKey] ?? g.formKey}`}
                              value={g.mode}
                              disabled={used > 0}
                              title={
                                used > 0
                                  ? `No se puede cambiar el modo: ${used} ${used === 1 ? "empleado ya la empezó" : "empleados ya la empezaron"}`
                                  : FORM_MODE_HINT[g.mode]
                              }
                              onChange={(e) => void handleModeChange(g.formKey, e.target.value as FormMode)}
                              className="rounded-lg border border-brand-line bg-white px-2 py-1.5 text-xs text-brand-gray outline-none focus:border-brand-blue disabled:cursor-not-allowed disabled:bg-brand-light"
                            >
                              {(["admin_applied", "self"] as const).map((m) => (
                                <option key={m} value={m}>
                                  {FORM_MODE_LABEL[m]}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                        {new Date(g.assignedAt).toLocaleDateString("es-MX")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                        {g.dueAt ? new Date(g.dueAt).toLocaleDateString("es-MX") : "—"}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-brand-gray">{g.completed}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-brand-gray">{g.partial}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-brand-gray">{g.pending}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-brand-light">
                            <div className="h-full bg-brand-black" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="whitespace-nowrap text-xs text-brand-muted">
                            {pct}% · {g.completed}/{g.employeesTotal} empleados
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        {(() => {
                          const used = data.guidesInUse[g.formKey] ?? 0;
                          return (
                            <span title={used > 0 ? inUseMessage(used) : undefined} className="inline-block">
                              <button
                                type="button"
                                onClick={() => void handleUnassign(g.formKey)}
                                disabled={used > 0}
                                className="rounded-lg border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-gray hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Desasignar
                              </button>
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
