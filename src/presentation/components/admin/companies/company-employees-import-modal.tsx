"use client";

import { useEffect, useRef, useState } from "react";
import type { CompanyEmployeeImportResult } from "@/core/domain/companies/types";
import {
  downloadCompanyEmployeesTemplate,
  importCompanyEmployees,
} from "@/infrastructure/http/companies-api";
import { showError } from "@/shared/lib/alerts";

interface CompanyEmployeesImportModalProps {
  open: boolean;
  companyId: string;
  companyName: string;
  onClose: () => void;
  onImported: () => void;
}

const STATUS_LABEL = {
  created: { text: "Creado", className: "bg-green-50 text-green-700" },
  existing: { text: "Ya existe", className: "bg-brand-light text-brand-muted" },
  linked: { text: "Vinculado", className: "bg-blue-50 text-blue-700" },
  error: { text: "Error", className: "bg-red-50 text-red-700" },
} as const;

export function CompanyEmployeesImportModal({
  open,
  companyId,
  companyName,
  onClose,
  onImported,
}: CompanyEmployeesImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<CompanyEmployeeImportResult | null>(null);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  });

  if (!open) return null;

  function handleClose() {
    setFile(null);
    setResult(null);
    setSendWelcomeEmail(false);
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadCompanyEmployeesTemplate(companyId);
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setIsImporting(true);
    try {
      const res = await importCompanyEmployees(companyId, file, { sendWelcomeEmail });
      setResult(res);
      onImported();
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo importar el Excel");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:py-10">
      {/* Fondo: no cierra el modal (solo los botones de cerrar). */}
      <div aria-hidden className="fixed inset-0 bg-brand-gray/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-employees-title"
        className="relative w-full max-w-3xl rounded-2xl border border-brand-line bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="bulk-employees-title" className="font-display text-lg font-bold text-brand-gray">
              Carga masiva de empleados
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Se registran como trabajadores vinculados a {companyName}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            aria-label="Cerrar"
            className="rounded-lg px-2 py-1 text-lg leading-none text-brand-muted hover:bg-brand-light"
          >
            ×
          </button>
        </div>

        {!result ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-brand-line bg-brand-light/50 p-4 text-sm">
              <p className="font-semibold text-brand-gray">1. Descarga la plantilla</p>
              <p className="mt-1 text-brand-muted">
                Columnas: CURP, Apellido paterno, Apellido materno, Nombre(s), Correo, Teléfono,
                Puesto y Código ocupación STPS. Obligatorias: CURP, apellido paterno, nombre(s) y
                correo.
              </p>
              <p className="mt-1 text-brand-muted">
                Opcional: Código ocupación STPS (hoja «Catálogo STPS»; necesario para DC3 / cursos
                con empresa) y columnas de la Guía V con listas desplegables. La Guía V la llena
                quien sube el Excel; los empleados no la contestan.
              </p>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={isDownloading}
                className="mt-3 rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
              >
                {isDownloading ? "Descargando..." : "Descargar plantilla Excel"}
              </button>
            </div>

            <div className="rounded-xl border border-brand-line p-4 text-sm">
              <p className="font-semibold text-brand-gray">2. Sube el archivo llenado</p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-sm text-brand-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand-light file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-gray"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line p-4 text-sm text-brand-gray">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-line"
              />
              <span>Enviar correo con usuario y contraseña a los empleados nuevos</span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isImporting}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={!file || isImporting}
                className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
              >
                {isImporting ? "Importando..." : "Importar empleados"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-xl border border-brand-line p-3">
                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                <p className="text-xs text-brand-muted">Creados</p>
              </div>
              <div className="rounded-xl border border-brand-line p-3">
                <p className="text-2xl font-bold text-brand-gray">{result.existing}</p>
                <p className="text-xs text-brand-muted">Ya existían</p>
              </div>
              <div className="rounded-xl border border-brand-line p-3">
                <p className="text-2xl font-bold text-blue-700">{result.linked ?? 0}</p>
                <p className="text-xs text-brand-muted">Vinculados</p>
              </div>
              <div className="rounded-xl border border-brand-line p-3">
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
                <p className="text-xs text-brand-muted">Con error</p>
              </div>
            </div>

            <p className="text-xs text-brand-muted">
              {result.welcomeEmailSent
                ? "Se envió correo de bienvenida a los empleados creados."
                : "No se enviaron correos de bienvenida."}
            </p>

            <div className="overflow-x-auto rounded-xl border border-brand-line">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-line bg-brand-light/60 text-xs uppercase tracking-wide text-brand-muted">
                    <th className="px-4 py-3 font-semibold">Fila</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">CURP</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {result.rows.map((row) => (
                    <tr key={row.row}>
                      <td className="px-4 py-3 text-brand-muted">{row.row}</td>
                      <td className="px-4 py-3 text-brand-gray">
                        {row.name}
                        <span className="block text-xs text-brand-muted">{row.email}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-muted">{row.curp}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_LABEL[row.status].className}`}
                        >
                          {STATUS_LABEL[row.status].text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-muted">{row.message ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
              >
                Subir otro archivo
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
