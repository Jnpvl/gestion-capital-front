"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EMPLOYEE_FORM_STATUS_LABEL,
  FORM_SHORT_LABEL,
  isSectionVisible,
  type EmployeeFormDetail,
  type FormAnswers,
  type FormDefinition,
  type FormKey,
  type FormQuestion,
} from "@/core/domain/forms/types";
import {
  FormsApiError,
  getEmployeeFormDetail,
  getForm,
  updateEmployeeForm,
} from "@/infrastructure/http/forms-api";
import {
  getPortalEmployeeFormDetail,
  getPortalForm,
} from "@/infrastructure/http/company-portal-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
import {
  FormQuestionInput,
  optionsFor,
} from "@/presentation/components/admin/forms/form-question-input";

interface EmployeeFormPreviewModalProps {
  companyId: string;
  studentId: string;
  employeeName: string;
  formKey: FormKey;
  onClose: () => void;
  /** Se llama después de guardar (para refrescar los íconos del listado). */
  onSaved?: () => void;
  /** Portal de empresa: solo ver, sin Editar ni guardar. */
  readOnly?: boolean;
}

function answerLabel(form: FormDefinition, q: FormQuestion, value: string | undefined): string {
  if (!value) return "—";
  if (q.kind === "text") return value;
  return optionsFor(form, q).find((o) => o.value === value)?.label ?? value;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

/** Vista (y edición) de lo que se cargó en un formulario para un empleado. */
export function EmployeeFormPreviewModal({
  companyId,
  studentId,
  employeeName,
  formKey,
  onClose,
  onSaved,
  readOnly = false,
}: EmployeeFormPreviewModalProps) {
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [detail, setDetail] = useState<EmployeeFormDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FormAnswers>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [f, d] = await Promise.all(
      readOnly
        ? [getPortalForm(formKey), getPortalEmployeeFormDetail(studentId, formKey)]
        : [getForm(formKey), getEmployeeFormDetail(companyId, studentId, formKey)],
    );
    setForm(f.form);
    setDetail(d);
    // Sin aplicar: se abre directo en edición.
    if (d.status === "not_applied" && !readOnly) {
      setDraft({});
      setFieldErrors({});
      setEditing(true);
    }
  }, [companyId, studentId, formKey, readOnly]);

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar"));
  }, [load]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [saving]);

  function startEdit() {
    setDraft({ ...(detail?.answers ?? {}) });
    setFieldErrors({});
    setEditing(true);
  }

  async function save() {
    if (!form || readOnly) return;
    setSaving(true);
    setFieldErrors({});
    try {
      // Se manda cada pregunta; "" borra el dato.
      const answers: Record<string, string> = {};
      for (const s of form.sections) for (const q of s.questions) answers[q.id] = (draft[q.id] ?? "").trim();
      const updated = await updateEmployeeForm(companyId, studentId, formKey, answers);
      setDetail(updated);
      setEditing(false);
      onSaved?.();
      showSuccess("Datos guardados");
    } catch (err) {
      if (err instanceof FormsApiError && err.fields.length > 0) {
        const map: Record<string, string> = {};
        for (const f of err.fields) map[f.field.replace(/^answers\./, "")] = f.message;
        setFieldErrors(map);
      }
      showError(err instanceof Error ? err.message : "No se pudieron guardar los datos");
    } finally {
      setSaving(false);
    }
  }

  // Solo secciones que aplican según las preguntas filtro (en edición, con el borrador).
  const sections =
    form && detail
      ? form.sections.filter((s) => isSectionVisible(s, editing ? draft : detail.answers, form))
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      {/* Fondo: no cierra el modal (solo los botones de cerrar). */}
      <div aria-hidden className="fixed inset-0 bg-brand-gray/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-form-preview-title"
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-clip rounded-2xl border border-brand-line bg-white shadow-xl sm:max-h-[90vh]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-line px-4 py-4 sm:px-6">
          <div>
            <h3
              id="employee-form-preview-title"
              className="font-display text-lg font-bold text-brand-gray"
            >
              {form?.title ?? FORM_SHORT_LABEL[formKey]}
              {detail && (
                <span className="ml-2 align-middle text-xs font-semibold text-brand-muted">
                  · {EMPLOYEE_FORM_STATUS_LABEL[detail.status]}
                </span>
              )}
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              {employeeName}
              {form?.subtitle ? ` · ${form.subtitle}` : ""}
            </p>
            {detail && (
              <p className="mt-1 text-xs text-brand-muted">
                Actualizado: {formatDateTime(detail.updatedAt)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {form && detail && !editing && !readOnly && (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-lg border border-brand-line px-3 py-1.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
              >
                Editar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar"
              className="rounded-lg px-2 py-1 text-lg leading-none text-brand-muted hover:bg-brand-light"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : !form || !detail ? (
            <p className="text-sm text-brand-muted">Cargando...</p>
          ) : (
            <div className="space-y-5">
              {sections.map((section) => (
                <section
                  key={section.id}
                  className={`overflow-hidden rounded-xl border border-brand-line ${
                    section.showIf ? "form-section-reveal" : ""
                  }`}
                >
                  {(section.title || section.instructions) && (
                    <header className="border-b border-brand-line bg-brand-light/60 px-4 py-3">
                      {section.title && (
                        <h4 className="text-sm font-semibold text-brand-gray">{section.title}</h4>
                      )}
                      {section.instructions && (
                        <p className={`text-sm text-brand-muted ${section.title ? "mt-0.5" : ""}`}>
                          {section.instructions}
                        </p>
                      )}
                    </header>
                  )}
                  {editing ? (
                    <ol className="divide-y divide-brand-line">
                      {section.questions.map((q) => (
                        <li key={q.id} className="px-4 py-4">
                          <p className="flex gap-2 text-sm font-medium text-brand-gray">
                            {q.number != null && (
                              <span className="w-7 shrink-0 text-right tabular-nums text-brand-muted">
                                {q.number}.
                              </span>
                            )}
                            <span className="min-w-0">{q.text}</span>
                          </p>
                          <div className={q.number != null ? "pl-9" : undefined}>
                          <FormQuestionInput
                            form={form}
                            question={q}
                            value={draft[q.id]}
                            onChange={(v) => {
                              setDraft((d) => ({ ...d, [q.id]: v }));
                              setFieldErrors((e) => ({ ...e, [q.id]: "" }));
                            }}
                            variant={formKey === "nom035_guia5" ? "select" : "radios"}
                            namePrefix={`${studentId}-`}
                          />
                          {q.note && (
                            <p className="mt-2 text-xs text-brand-muted">{q.note}</p>
                          )}
                          {fieldErrors[q.id] && (
                            <p className="mt-1 text-xs font-medium text-red-700">
                              {fieldErrors[q.id]}
                            </p>
                          )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <dl className="divide-y divide-brand-line text-sm">
                      {section.questions.map((q) => (
                        <div key={q.id} className="grid gap-1 px-4 py-2.5 sm:grid-cols-2 sm:gap-4">
                          <dt className="text-brand-muted">
                            {q.number != null ? `${q.number}. ` : ""}
                            {q.text}
                          </dt>
                          <dd className="font-medium text-brand-gray">
                            {answerLabel(form, q, detail.answers[q.id])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              ))}

            </div>
          )}
        </div>
          {editing && form && detail && (
            <div className="flex shrink-0 justify-end gap-3 border-t border-brand-line bg-white px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => {
                  if (detail.status === "not_applied") {
                    onClose();
                    return;
                  }
                  setEditing(false);
                  setFieldErrors({});
                }}
                disabled={saving}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
