"use client";

import { useState } from "react";
import { EmployeePeopleTrigger } from "./employee-people-trigger";
import { EmployeeRiskBar } from "./employee-risk-bar";
import type {
  Guide1ResponseSummary,
  Guide1SectionSummary,
} from "@/core/domain/forms/types";

const format = new Intl.NumberFormat("es-MX");

/** Colores del informe NOM-035 I (segmentación por género). */
const GENDER_COLORS = {
  men: "#90B048",
  women: "#F07030",
  other: "#F8B830",
  unspecified: "#10B0D8",
  total: "#2A2A2E",
} as const;

const GENDER_SEGMENTS = [
  { key: "men", label: "Hombres", color: GENDER_COLORS.men },
  { key: "women", label: "Mujeres", color: GENDER_COLORS.women },
  { key: "other", label: "Otro", color: GENDER_COLORS.other },
  { key: "unspecified", label: "Sin especificar", color: GENDER_COLORS.unspecified },
] as const;

type ViewMode = "table" | "chart";

function SectionTable({
  section,
  readOnly,
  returnTo,
}: {
  section: Guide1SectionSummary;
  readOnly: boolean;
  returnTo: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-[#DFE1E6] text-brand-muted">
          <tr>
            <th className="px-6 py-3 font-semibold">Pregunta</th>
            {GENDER_SEGMENTS.map((segment) => (
              <th
                key={segment.key}
                className="px-4 py-3 text-center font-semibold"
                style={{ color: segment.color }}
              >
                {segment.label}
              </th>
            ))}
            <th className="px-6 py-3 text-center font-semibold text-brand-gray">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-line">
          {section.questions.map((question) => (
            <tr key={question.id} className="align-top">
              <td className="px-6 py-3 text-brand-gray">{question.text}</td>
              {GENDER_SEGMENTS.map((segment) => (
                <td key={segment.key} className="px-2 py-2 text-center">
                  <EmployeePeopleTrigger
                    label={`${question.text} · ${segment.label}`}
                    contextLabel={section.title ?? "Guía I"}
                    people={question.people[segment.key]}
                    readOnly={readOnly}
                    returnTo={returnTo}
                    color={segment.color}
                    className="inline-flex min-w-[2.5rem] justify-center px-2 py-1 font-semibold tabular-nums"
                  >
                    <span style={{ color: segment.color }}>
                      {format.format(question[segment.key])}
                    </span>
                  </EmployeePeopleTrigger>
                </td>
              ))}
              <td
                className="px-6 py-3 text-center font-bold tabular-nums"
                style={{ color: GENDER_COLORS.total }}
              >
                {format.format(question.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-brand-line bg-[#F0F1F3]">
            <td className="px-6 py-3" colSpan={5} />
            <td
              className="px-6 py-3 text-center text-lg font-bold tabular-nums"
              style={{ color: GENDER_COLORS.total }}
            >
              {format.format(section.totalYes)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SectionChart({
  section,
  readOnly,
  returnTo,
}: {
  section: Guide1SectionSummary;
  readOnly: boolean;
  returnTo: string;
}) {
  return (
    <div className="space-y-8 px-6 py-5">
      {section.questions.map((question) => (
        <div key={question.id} className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-brand-gray">{question.text}</p>
            <span
              className="shrink-0 text-sm font-bold tabular-nums"
              style={{ color: GENDER_COLORS.total }}
            >
              {format.format(question.total)}
            </span>
          </div>
          <EmployeeRiskBar
            label={`${section.title ?? "Guía I"} · ${question.text}`}
            readOnly={readOnly}
            returnTo={returnTo}
            segments={GENDER_SEGMENTS.map((segment) => ({
              key: segment.key,
              label: segment.label,
              color: segment.color,
              count: question[segment.key],
              people: question.people[segment.key],
            }))}
          />
        </div>
      ))}
      <div className="border-t border-brand-line pt-4 text-right text-sm font-bold tabular-nums text-brand-gray">
        {format.format(section.totalYes)}
      </div>
    </div>
  );
}

export function CompanyDashboardGuide1Responses({
  summary,
  assigned,
  readOnly,
  returnTo,
}: {
  summary: Guide1ResponseSummary | null | undefined;
  assigned: boolean;
  readOnly: boolean;
  returnTo: string;
}) {
  const [view, setView] = useState<ViewMode>("table");

  return (
    <section className="space-y-6" aria-label="Resumen de respuestas por sección">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-brand-gray">
            Resumen de las respuestas por sección, pregunta y segmentación por género
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Conteos de respuestas “Sí” por pregunta de la Guía I, cruzados con el sexo capturado en
            Guía V. Pasa el cursor o haz clic para ver a las personas.
            {summary ? ` · ${format.format(summary.evaluated)} evaluaciones completas.` : null}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">
            {GENDER_SEGMENTS.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="flex shrink-0 gap-1 rounded-xl bg-brand-light p-1"
          role="group"
          aria-label="Opción de visualización"
        >
          {(
            [
              { key: "table", label: "Tabla" },
              { key: "chart", label: "Gráfica" },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={view === option.key}
              onClick={() => setView(option.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                view === option.key
                  ? "bg-brand-blue text-white"
                  : "text-brand-muted hover:text-brand-gray"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!assigned ? (
        <div className="rounded-2xl border border-brand-line bg-white p-6 text-sm text-brand-muted">
          La Guía I no está asignada en este año.
        </div>
      ) : !summary?.evaluated ? (
        <div className="rounded-2xl border border-brand-line bg-white p-6 text-sm text-brand-muted">
          Sin evaluaciones completas de Guía I para construir este resumen.
        </div>
      ) : (
        summary.sections.map((section) => (
          <article
            key={section.id}
            className="overflow-hidden rounded-2xl border border-brand-line bg-white"
          >
            <header className="border-b border-brand-line px-6 py-5">
              <h4 className="font-display text-lg font-bold text-brand-gray">{section.title}</h4>
              {section.instructions ? (
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {section.instructions}
                </p>
              ) : null}
            </header>

            {view === "table" ? (
              <SectionTable section={section} readOnly={readOnly} returnTo={returnTo} />
            ) : (
              <SectionChart section={section} readOnly={readOnly} returnTo={returnTo} />
            )}
          </article>
        ))
      )}
    </section>
  );
}
