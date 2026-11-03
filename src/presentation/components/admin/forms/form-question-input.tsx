"use client";

import {
  FREQUENCY_OPTIONS,
  YES_NO_OPTIONS,
  type FormDefinition,
  type FormQuestion,
} from "@/core/domain/forms/types";

export function optionsFor(form: FormDefinition, q: FormQuestion) {
  if (q.options) return q.options;
  if (q.kind === "yesno" || form.scale === "yesno") return YES_NO_OPTIONS;
  return FREQUENCY_OPTIONS;
}

interface FormQuestionInputProps {
  form: FormDefinition;
  question: FormQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  /** "radios" (lista vertical, como en los formularios) o "select" (desplegable). */
  variant?: "radios" | "select";
  /** Prefijo para el name de los radios (evita choques entre instancias). */
  namePrefix?: string;
}

/** Control de respuesta para una pregunta de formulario NOM-035. */
export function FormQuestionInput({
  form,
  question: q,
  value,
  onChange,
  variant = "radios",
  namePrefix = "",
}: FormQuestionInputProps) {
  if (q.kind === "text") {
    return (
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        maxLength={200}
        className="mt-3 w-full max-w-md rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
      />
    );
  }
  const options = optionsFor(form, q);
  if (variant === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full max-w-md rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
      >
        <option value="">— Sin dato —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
  // Sí/No: dos opciones compactas en fila; escalas largas: lista vertical.
  const inline = options.length <= 2;
  return (
    <div
      role="radiogroup"
      className={inline ? "mt-3 flex flex-wrap gap-2" : "mt-3 flex max-w-xl flex-col gap-2"}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`relative flex cursor-pointer items-center gap-3 rounded-lg border text-sm transition-colors ${
              inline ? "min-w-24 px-4 py-2" : "w-full px-4 py-3"
            } ${
              checked
                ? "border-brand-blue bg-blue-50 font-medium text-brand-gray"
                : "border-brand-line text-brand-gray hover:bg-brand-light"
            }`}
          >
            <input
              type="radio"
              name={`${namePrefix}${q.id}`}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                checked ? "border-brand-blue" : "border-brand-line"
              }`}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-brand-blue" />}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
