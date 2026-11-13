"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  EMPLOYEE_FORM_STATUS_LABEL,
  FORM_SHORT_LABEL,
  formResultLine,
  type EmployeeFormState,
  type EmployeeFormStatus,
  type FormKey,
} from "@/core/domain/forms/types";

const STATUS_CLASS: Record<EmployeeFormStatus, string> = {
  completed: "border-green-600 bg-green-50 text-green-700",
  partial: "border-amber-500 bg-amber-50 text-amber-700",
  pending: "border-dashed border-brand-line bg-white text-brand-muted",
  not_applied: "border-dashed border-brand-muted/60 bg-white text-brand-muted",
  not_selected: "border-brand-line bg-slate-100 text-slate-400 opacity-60",
};

const READONLY_NOT_APPLIED_CLASS = "border-brand-line bg-brand-light text-brand-muted/70";

/** Qué significa cada color (tooltip y leyenda). */
export const STATUS_MEANING: Record<EmployeeFormStatus, string> = {
  completed: "Completa (todos los datos cargados)",
  partial: "Parcial (faltan datos)",
  pending: "Pendiente (sin datos aún)",
  not_applied: "Sin aplicar (el empleado aún no tiene este formulario)",
  not_selected: "No seleccionado para el muestreo de Guía III",
};

const NUMERAL: Record<FormKey, string> = {
  nom035_guia1: "I",
  nom035_guia2: "II",
  nom035_guia3: "III",
  nom035_guia4: "IV",
  nom035_guia5: "V",
};

/** Nombre descriptivo corto por guía (según las definiciones NOM-035). */
const FORM_DESCRIPTION: Record<FormKey, string> = {
  nom035_guia1: "Acontecimientos traumáticos severos",
  nom035_guia2: "Factores de riesgo psicosocial",
  nom035_guia3: "Factores de riesgo psicosocial y entorno organizacional",
  nom035_guia4: "Documento de referencia (PDF)",
  nom035_guia5: "Datos generales del trabajador",
};

function formName(key: FormKey) {
  return `${FORM_SHORT_LABEL[key] ?? key} · ${FORM_DESCRIPTION[key] ?? ""}`;
}

interface TipState {
  form: EmployeeFormState;
  x: number;
  y: number;
}

/** Leyenda de colores para la columna Formularios. */
export function EmployeeFormsLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
      <span className="font-semibold text-brand-gray">Formularios:</span>
      {(["completed", "partial", "pending", "not_applied"] as const).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-3.5 w-3.5 rounded border ${STATUS_CLASS[s]}`} />
          {STATUS_MEANING[s].split(" = ")[1]}
        </span>
      ))}
      <span>· Clic en un ícono para ver los datos</span>
    </div>
  );
}

/** Un ícono por formulario del empleado; el estilo indica el estado. */
export function EmployeeFormsIcons({
  forms,
  onOpen,
  readOnly = false,
}: {
  forms: EmployeeFormState[] | undefined;
  onOpen: (formKey: FormKey) => void;
  /** Portal de empresa: sin "+" (no se aplica nada) y "sin aplicar" en estilo neutro. */
  readOnly?: boolean;
}) {
  const [tip, setTip] = useState<TipState | null>(null);

  if (!forms || forms.length === 0) return <span className="text-brand-muted">—</span>;

  const show = (form: EmployeeFormState, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setTip({ form, x: r.left + r.width / 2, y: r.bottom + 8 });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {forms.map((f) => {
        const disabled = f.status === "not_selected";
        const line = f.status === "completed" ? formResultLine(f.result) : null;
        const title = `${formName(f.formKey)} · ${EMPLOYEE_FORM_STATUS_LABEL[f.status]}${line ? ` · ${line}` : ""}`;
        return (
          <button
            key={f.formKey}
            type="button"
            disabled={disabled}
            title={tip ? undefined : title}
            aria-label={title}
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onOpen(f.formKey);
            }}
            onMouseEnter={(e) => show(f, e.currentTarget)}
            onMouseLeave={() => setTip(null)}
            onFocus={(e) => show(f, e.currentTarget)}
            onBlur={() => setTip(null)}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-bold transition-opacity ${
              disabled
                ? "cursor-not-allowed"
                : "hover:opacity-80"
            } ${readOnly && f.status === "not_applied" ? READONLY_NOT_APPLIED_CLASS : STATUS_CLASS[f.status]}`}
          >
            {NUMERAL[f.formKey] ?? "?"}
            {f.status === "not_applied" && !readOnly && <span className="ml-0.5">+</span>}
          </button>
        );
      })}
      {tip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: tip.y,
              left: Math.min(Math.max(tip.x, 140), window.innerWidth - 140),
              transform: "translateX(-50%)",
            }}
            className="pointer-events-none z-[60] w-64 rounded-lg bg-brand-black px-3 py-2 text-xs text-white shadow-lg"
          >
            <p className="font-semibold">{formName(tip.form.formKey)}</p>
            <p className="mt-1">{STATUS_MEANING[tip.form.status]}</p>
            {tip.form.status === "completed" && formResultLine(tip.form.result) && (
              <p className="mt-1 font-semibold">{formResultLine(tip.form.result)}</p>
            )}
            <p className="mt-1.5 text-white/60">
              {tip.form.status === "not_selected"
                ? "No aplica en esta evaluación por muestreo"
                : tip.form.status === "not_applied"
                  ? "Clic para aplicar"
                  : "Clic para ver los datos"}
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}
