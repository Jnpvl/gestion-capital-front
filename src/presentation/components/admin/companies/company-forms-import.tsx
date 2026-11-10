"use client";

import { useEffect, useState } from "react";
import { FORM_SHORT_LABEL, type FormKey } from "@/core/domain/forms/types";
import {
  downloadFormTemplate,
  getCompanyForms,
  importFormExcel,
  type FormImportResult,
} from "@/infrastructure/http/forms-api";

const keys: FormKey[] = ["nom035_guia1", "nom035_guia2", "nom035_guia3"];

export function CompanyFormsImport({
  companyId,
  evaluationYears,
  onImported,
}: {
  companyId: string;
  evaluationYears: number[];
  onImported: (year: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [importYear, setImportYear] = useState(currentYear);
  const [assigned, setAssigned] = useState<FormKey[]>([]);
  const yearOptions = Array.from(
    new Set([...(evaluationYears ?? []), importYear, currentYear - 1, currentYear, currentYear + 1]),
  ).sort((a, b) => b - a);

  useEffect(() => {
    let cancelled = false;
    void getCompanyForms(companyId, importYear)
      .then((result) => {
        if (!cancelled) setAssigned(result.assignedFormKeys);
      })
      .catch(() => {
        if (!cancelled) setAssigned([]);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, importYear]);

  return (
    <section className="rounded-2xl border border-brand-line bg-white p-6">
      <h2 className="font-display text-lg font-bold text-brand-gray">Importar respuestas desde Excel</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Elige el año de evaluación al que quieres cargar las respuestas. La guía debe estar asignada
        para ese mismo año. Las evaluaciones con respuestas previas en ese año se omiten.
      </p>

      <div className="mt-4 max-w-xs">
        <label className="text-sm font-semibold text-brand-gray" htmlFor="import-evaluation-year">
          Año al que se importará
        </label>
        <select
          id="import-evaluation-year"
          value={importYear}
          onChange={(e) => setImportYear(Number(e.target.value))}
          className="mt-1.5 block w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm text-brand-gray"
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-3">
        {keys.filter((key) => assigned.includes(key)).map((key) => (
          <GuideImport
            key={`${importYear}-${key}`}
            companyId={companyId}
            guide={key}
            year={importYear}
            assigned
            onImported={() => onImported(importYear)}
          />
        ))}
      </div>
      {assigned.length === 0 && (
        <p className="mt-4 text-sm text-brand-muted">
          No hay guías asignadas para {importYear}. Asigna una arriba para poder importar respuestas.
        </p>
      )}
    </section>
  );
}

function GuideImport({
  companyId,
  guide,
  year,
  assigned,
  onImported,
}: {
  companyId: string;
  guide: FormKey;
  year: number;
  assigned: boolean;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<FormImportResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy("download");
    setError(null);
    try {
      await downloadFormTemplate(companyId, guide, year);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar");
    } finally {
      setBusy(null);
    }
  }

  async function upload(dryRun: boolean) {
    if (!file) return;
    setBusy(dryRun ? "validate" : "import");
    setError(null);
    try {
      setResult(await importFormExcel(companyId, guide, file, dryRun, year));
      if (!dryRun) onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
      setResult(null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="min-w-0 rounded-xl border border-brand-line p-4">
      <h3 className="font-semibold">{FORM_SHORT_LABEL[guide]}</h3>
      <p className="mt-1 text-xs text-brand-muted">
        {assigned
          ? `Asignada para ${year}`
          : `Asigna esta guía para ${year} antes de importar`}
      </p>
      <button
        type="button"
        disabled={!!busy}
        onClick={() => void download()}
        className="mt-4 w-full rounded-lg border border-brand-line px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-light disabled:opacity-50"
      >
        {busy === "download" ? "Descargando…" : "Descargar plantilla Excel"}
      </button>
      <label className="mt-4 block text-xs font-medium text-brand-muted">
        Archivo de respuestas
        <input
          type="file"
          accept=".xlsx"
          disabled={!!busy || !assigned}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError(null);
          }}
          className="mt-2 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-brand-light file:p-2 file:font-semibold disabled:opacity-50"
        />
      </label>
      <button
        type="button"
        disabled={!file || !!busy || !assigned}
        onClick={() => void upload(true)}
        className="mt-4 w-full rounded-lg border border-brand-blue px-3 py-2 text-sm font-semibold text-brand-blue disabled:opacity-50"
      >
        {busy === "validate" ? "Validando…" : `Validar para ${year}`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-4 space-y-3">
          <p role="status" className="text-sm font-semibold">
            {result.dryRun
              ? `${result.valid} listas para importar a ${result.evaluationYear ?? year}`
              : `${result.imported} importadas a ${result.evaluationYear ?? year}`}{" "}
            · {result.errors} con error · {result.skipped} omitidas
          </p>
          {result.dryRun && result.valid > 0 && (
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void upload(false)}
              className="w-full rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === "import"
                ? "Importando…"
                : `Importar ${result.valid} evaluaciones a ${year}`}
            </button>
          )}
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
              Ver detalle por fila
            </summary>
            <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto">
              {result.rows.map((row) => (
                <li
                  key={row.row}
                  className={`rounded-lg p-3 text-xs ${
                    row.status === "error"
                      ? "bg-red-50 text-red-800"
                      : "bg-brand-light text-brand-gray"
                  }`}
                >
                  <strong>
                    Fila {row.row} · {row.employee}
                  </strong>
                  <p className="mt-1 break-words">{row.message}</p>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </article>
  );
}
