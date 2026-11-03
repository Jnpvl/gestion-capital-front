"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  isSectionVisible,
  type FormAnswers,
  type FormDefinition,
} from "@/core/domain/forms/types";
import { FormQuestionInput } from "@/presentation/components/admin/forms/form-question-input";
import { getForm } from "@/infrastructure/http/forms-api";
import { showError } from "@/shared/lib/alerts";

export function FormPreviewContent({ formKey }: { formKey: string }) {
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [failed, setFailed] = useState(false);
  const [answers, setAnswers] = useState<FormAnswers>({});

  useEffect(() => {
    getForm(formKey)
      .then((r) => setForm(r.form))
      .catch((err) => {
        showError(err instanceof Error ? err.message : "Error al cargar el formulario");
        setFailed(true);
      });
  }, [formKey]);

  const visible = useMemo(
    () => (form ? form.sections.filter((s) => isSectionVisible(s, answers, form)) : []),
    [form, answers],
  );

  if (failed) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No se encontró el formulario.
      </div>
    );
  }
  if (!form) return <div className="text-sm text-brand-muted">Cargando formulario...</div>;

  const hidden = form.sections.length - visible.length;
  const setAnswer = (id: string, value: string) => setAnswers((a) => ({ ...a, [id]: value }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/formularios" className="text-sm font-medium text-brand-blue hover:underline">
          ← Volver a formularios
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-brand-gray">{form.title}</h1>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Vista previa · no se guarda
          </span>
        </div>
        <p className="mt-1 text-sm text-brand-gray">{form.subtitle}</p>
        {form.instructions && <p className="mt-2 text-sm text-brand-muted">{form.instructions}</p>}
      </div>

      {visible.map((section) => (
        <section key={section.id} className="rounded-2xl border border-brand-line bg-white">
          {(section.title || section.instructions) && (
            <div className="border-b border-brand-line p-6">
              {section.title && (
                <h2 className="font-display text-base font-bold text-brand-gray">{section.title}</h2>
              )}
              {section.instructions && (
                <p className={`text-sm text-brand-muted ${section.title ? "mt-1" : ""}`}>
                  {section.instructions}
                </p>
              )}
            </div>
          )}
          <ol className="divide-y divide-brand-line">
            {section.questions.map((q) => (
              <li key={q.id} className="p-6">
                <p className="text-sm font-medium text-brand-gray">
                  {q.number != null && <span className="mr-2 text-brand-muted">{q.number}.</span>}
                  {q.text}
                </p>
                {q.note && <p className="mt-1 text-xs text-brand-muted">{q.note}</p>}
                <FormQuestionInput
                  form={form}
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              </li>
            ))}
          </ol>
        </section>
      ))}

      {hidden > 0 && (
        <p className="rounded-xl border border-dashed border-brand-line bg-white p-4 text-center text-sm text-brand-muted">
          {hidden} sección{hidden === 1 ? "" : "es"} oculta{hidden === 1 ? "" : "s"} según las
          respuestas (se muestran al contestar “Sí” en la pregunta filtro).
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setAnswers({})}
          className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
        >
          Limpiar respuestas
        </button>
      </div>
    </div>
  );
}
