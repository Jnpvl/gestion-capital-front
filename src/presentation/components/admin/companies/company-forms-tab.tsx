"use client";

import Link from "next/link";
import { useAuth } from "@/presentation/providers/auth-provider";
import { CompanyFormsImport } from "./company-forms-import";
import { useCallback, useEffect, useState } from "react";
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
  const [data, setData] = useState<CompanyFormsResponse | null>(null);
  const [selected, setSelected] = useState<FormKey[]>([]);
  const [dueAt, setDueAt] = useState("");
  const [modes, setModes] = useState<Partial<Record<FormKey, FormMode>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getCompanyForms(companyId);
      setData(result);
      return result;
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al cargar formularios");
      return null;
    }
  }, [companyId]);

  useEffect(() => {
    // Ya asignadas aparecen marcadas; si no hay ninguna, se proponen las sugeridas.
    void load().then(
      (r) => r && setSelected(r.assignedFormKeys.length ? r.assignedFormKeys : r.suggestedFormKeys),
    );
  }, [load]);

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
      text: `Se quitará ${label} de esta empresa. Ningún empleado la ha empezado, así que no se pierden respuestas.`,
      confirmText: "Sí, desasignar",
    });
    if (!ok) return;
    try {
      await unassignCompanyForm(companyId, key);
      const r = await load();
      if (r) setSelected((s) => s.filter((k) => k !== key || r.assignedFormKeys.includes(k)));
      showSuccess(`${label} desasignada`);
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
      await setCompanyFormMode(companyId, key, mode);
      await load();
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
      await createFormAssignment(companyId, {
        formKeys: newKeys,
        modes: Object.fromEntries(newKeys.map((k) => [k, modes[k] ?? "admin_applied"])),
        dueAt: dueAt ? new Date(`${dueAt}T23:59:59`).toISOString() : null,
      });
      await load();
      setDueAt("");
      showSuccess("Formularios asignados. Aún no se envían correos a los empleados.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo asignar");
    } finally {
      setIsSaving(false);
    }
  }

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
                        Asignada
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
                    </span>
                  ) : (
                    checked && (
                      <span className="mt-2 block" onClick={(e) => e.preventDefault()}>
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
                        <span className="mt-1 block text-xs text-brand-muted">
                          {FORM_MODE_HINT[modes[form.key] ?? "admin_applied"]}
                        </span>
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
                ? `Asignar (${newKeys.length})`
                : "Asignar"}
          </button>
        </div>
        <p className="mt-3 text-xs text-brand-muted">
          Se registra la asignación para los empleados vinculados. El envío del enlace a cada
          empleado está pendiente (no se envían correos).
        </p>
      </div>

      {(user?.role === "admin" || user?.role === "super_admin") && <CompanyFormsImport companyId={companyId} assigned={data.assignedFormKeys} onImported={() => { void load(); }} />}

      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="border-b border-brand-line p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Asignaciones</h2>
        </div>
        {progressRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-brand-muted">
            Aún no hay formularios asignados a esta empresa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                  <th className="px-6 py-3.5 font-semibold">Guía</th>
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
                    <tr key={g.formKey}>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-brand-gray">
                          {FORM_SHORT_LABEL[g.formKey] ?? g.formKey}
                        </span>
                        <span className="mt-0.5 block text-xs text-brand-muted">
                          {data.forms.find((f) => f.key === g.formKey)?.subtitle ?? ""}
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
