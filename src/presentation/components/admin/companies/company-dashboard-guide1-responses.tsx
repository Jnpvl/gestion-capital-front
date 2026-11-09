import type { Guide1ResponseSummary } from "@/core/domain/forms/types";

const format = new Intl.NumberFormat("es-MX");

/** Colores del informe NOM-035 I (segmentación por género). */
const GENDER_COLORS = {
  men: "#90B048",
  women: "#F07030",
  other: "#F8B830",
  unspecified: "#10B0D8",
  total: "#2A2A2E",
} as const;

export function CompanyDashboardGuide1Responses({
  summary,
  assigned,
}: {
  summary: Guide1ResponseSummary | null | undefined;
  assigned: boolean;
}) {
  return (
    <section className="space-y-6" aria-label="Resumen de respuestas por sección">
      <div>
        <h3 className="font-display text-xl font-bold text-brand-gray">
          Resumen de las respuestas por sección, pregunta y segmentación por género
        </h3>
        <p className="mt-2 text-sm text-brand-muted">
          Conteos de respuestas “Sí” por pregunta de la Guía I, cruzados con el sexo capturado en
          Guía V.
          {summary ? ` · ${format.format(summary.evaluated)} evaluaciones completas.` : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">
          {[
            { label: "Hombres", color: GENDER_COLORS.men },
            { label: "Mujeres", color: GENDER_COLORS.women },
            { label: "Otro", color: GENDER_COLORS.other },
            { label: "Sin especificar", color: GENDER_COLORS.unspecified },
          ].map((item) => (
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-[#DFE1E6] text-brand-muted">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Pregunta</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: GENDER_COLORS.men }}>
                      Hombres
                    </th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: GENDER_COLORS.women }}>
                      Mujeres
                    </th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: GENDER_COLORS.other }}>
                      Otro
                    </th>
                    <th
                      className="px-4 py-3 text-center font-semibold"
                      style={{ color: GENDER_COLORS.unspecified }}
                    >
                      Sin especificar
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-brand-gray">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {section.questions.map((question) => (
                    <tr key={question.id} className="align-top">
                      <td className="px-6 py-3 text-brand-gray">{question.text}</td>
                      <td
                        className="px-4 py-3 text-center font-semibold tabular-nums"
                        style={{ color: GENDER_COLORS.men }}
                      >
                        {format.format(question.men)}
                      </td>
                      <td
                        className="px-4 py-3 text-center font-semibold tabular-nums"
                        style={{ color: GENDER_COLORS.women }}
                      >
                        {format.format(question.women)}
                      </td>
                      <td
                        className="px-4 py-3 text-center font-semibold tabular-nums"
                        style={{ color: GENDER_COLORS.other }}
                      >
                        {format.format(question.other)}
                      </td>
                      <td
                        className="px-4 py-3 text-center font-semibold tabular-nums"
                        style={{ color: GENDER_COLORS.unspecified }}
                      >
                        {format.format(question.unspecified)}
                      </td>
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
          </article>
        ))
      )}
    </section>
  );
}
