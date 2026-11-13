"use client";

const PDF_URL = "/templates/nom035-guia4.pdf";

/** Guía IV siempre disponible en NOM-035: vista previa + descarga del PDF. */
export function CompanyDashboardGuia4() {
  return (
    <section className="space-y-6" aria-label="Guía IV">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            NOM-035-STPS-2018
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">
            Guía de Referencia IV
          </h2>
        </div>
        <a
          href={PDF_URL}
          download="nom035-guia4.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
        >
          Descargar PDF
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm">
        <iframe
          title="Vista previa Guía IV"
          src={`${PDF_URL}#view=FitH`}
          className="h-[min(80vh,900px)] w-full bg-brand-light"
        />
      </div>

      <p className="text-center text-xs text-brand-muted">
        Si el navegador no muestra el PDF,{" "}
        <a
          href={PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-blue hover:underline"
        >
          ábrelo en una pestaña nueva
        </a>
        .
      </p>
    </section>
  );
}
