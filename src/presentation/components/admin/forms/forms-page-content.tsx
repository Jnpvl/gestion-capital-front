"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormSummary } from "@/core/domain/forms/types";
import { listForms } from "@/infrastructure/http/forms-api";
import { showError } from "@/shared/lib/alerts";

export function FormsPageContent() {
  const [forms, setForms] = useState<FormSummary[] | null>(null);

  useEffect(() => {
    listForms()
      .then((r) => setForms(r.forms))
      .catch((err) => {
        showError(err instanceof Error ? err.message : "Error al cargar formularios");
        setForms([]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-gray">Formularios</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Cuestionarios de la NOM-035-STPS-2018. Se asignan desde la pestaña Formularios de cada
          empresa.
        </p>
      </div>

      {!forms ? (
        <div className="text-sm text-brand-muted">Cargando formularios...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((form) => (
            <article
              key={form.key}
              className="flex flex-col rounded-2xl border border-brand-line bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                {form.norm}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-brand-gray">{form.title}</h2>
              <p className="mt-1 text-sm text-brand-gray">{form.subtitle}</p>
              <p className="mt-2 text-sm text-brand-muted">{form.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-muted">
                  {form.items > 0 ? `${form.items} ítems` : `${form.questions} preguntas`}
                </span>
                <Link
                  href={`/admin/formularios/${form.key}`}
                  className="rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray"
                >
                  Vista previa
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
