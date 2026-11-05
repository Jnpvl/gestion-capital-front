"use client";

import { useState } from "react";
import {
  downloadPresencialTemplate,
  importPresencialExcel,
  type PresencialImportResult,
} from "@/infrastructure/http/courses-api";
import { showError, showSuccess } from "@/shared/lib/alerts";

interface CoursePresencialEmissionTabProps {
  courseId: string;
  coursePublished: boolean;
}

export function CoursePresencialEmissionTab({
  courseId,
  coursePublished,
}: CoursePresencialEmissionTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<PresencialImportResult | null>(null);
  const [sendAccessEmail, setSendAccessEmail] = useState(false);
  const [sendCertificateEmail, setSendCertificateEmail] = useState(false);

  async function handleDownloadTemplate() {
    setIsDownloading(true);
    try {
      await downloadPresencialTemplate(courseId);
      showSuccess("Plantilla descargada");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleImport(file: File | null) {
    if (!file) return;
    if (!coursePublished) {
      showError("Publica el curso antes de emitir constancias presenciales");
      return;
    }

    setIsImporting(true);
    setResult(null);
    try {
      const data = await importPresencialExcel(courseId, file, {
        sendAccessEmail,
        sendCertificateEmail,
      });
      setResult(data);
      if (data.errors === 0) {
        showSuccess(`Se procesaron ${data.issuedCertificates} constancias`);
      } else {
        showSuccess(
          `Proceso terminado: ${data.issuedCertificates} ok, ${data.errors} con error`,
        );
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo importar el Excel");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-gray">Emisión presencial</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Sube un Excel con los participantes. El sistema crea o reutiliza alumnos por CURP, registra
          la inscripción presencial ya terminada y genera el folio de la constancia (válido por QR
          sin login).
        </p>
      </div>

      <div className="rounded-xl border border-brand-line bg-brand-light/50 p-4 text-sm text-brand-muted">
        <p className="font-medium text-brand-gray">Columnas del Excel</p>
        <p className="mt-1">
          CURP, Apellido paterno, Apellido materno, Nombre(s), Correo (opcional), Teléfono
          (opcional), Fecha inicio, Fecha término. Las fechas van en formato día/mes/año (ej.
          12/03/2026).
        </p>
        {!coursePublished && (
          <p className="mt-2 text-red-600">El curso debe estar publicado para poder importar.</p>
        )}
      </div>

      <fieldset className="rounded-xl border border-brand-line bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-brand-gray">Notificaciones por correo</legend>
        <p className="mb-3 text-sm text-brand-muted">
          Elige qué avisos enviar al procesar este archivo. Si no marcas opciones, solo se crean las
          inscripciones y constancias, sin correos.
        </p>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={sendAccessEmail}
              disabled={isImporting}
              onChange={(event) => setSendAccessEmail(event.target.checked)}
              className="mt-0.5 size-4 rounded border-brand-line text-brand-blue focus:ring-brand-blue"
            />
            <span>
              <span className="block text-sm font-medium text-brand-gray">Enviar acceso al curso</span>
              <span className="block text-xs text-brand-muted">
                Envía la inscripción; si el alumno es nuevo, también sus credenciales de acceso.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={sendCertificateEmail}
              disabled={isImporting}
              onChange={(event) => setSendCertificateEmail(event.target.checked)}
              className="mt-0.5 size-4 rounded border-brand-line text-brand-blue focus:ring-brand-blue"
            />
            <span>
              <span className="block text-sm font-medium text-brand-gray">Enviar constancia</span>
              <span className="block text-xs text-brand-muted">
                Envía el aviso de curso terminado con la constancia adjunta y, cuando corresponda, el DC-3.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isDownloading}
          onClick={() => void handleDownloadTemplate()}
          className="rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-50"
        >
          {isDownloading ? "Descargando..." : "Descargar plantilla Excel"}
        </button>

        <label className="inline-flex cursor-pointer items-center rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50">
          {isImporting ? "Importando..." : "Subir Excel y emitir"}
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            disabled={isImporting || !coursePublished}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.target.value = "";
              void handleImport(file);
            }}
          />
        </label>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-brand-line bg-white p-3 text-sm">
              <p className="text-brand-muted">Filas</p>
              <p className="text-lg font-semibold text-brand-gray">{result.totalRows}</p>
            </div>
            <div className="rounded-lg border border-brand-line bg-white p-3 text-sm">
              <p className="text-brand-muted">Alumnos nuevos</p>
              <p className="text-lg font-semibold text-brand-gray">{result.createdStudents}</p>
            </div>
            <div className="rounded-lg border border-brand-line bg-white p-3 text-sm">
              <p className="text-brand-muted">Reutilizados</p>
              <p className="text-lg font-semibold text-brand-gray">{result.reusedStudents}</p>
            </div>
            <div className="rounded-lg border border-brand-line bg-white p-3 text-sm">
              <p className="text-brand-muted">Folios / errores</p>
              <p className="text-lg font-semibold text-brand-gray">
                {result.issuedCertificates} / {result.errors}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-light/70 text-brand-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Fila</th>
                  <th className="px-3 py-2 font-medium">CURP</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Folio</th>
                  <th className="px-3 py-2 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={`${row.row}-${row.curp}`} className="border-t border-brand-line">
                    <td className="px-3 py-2">{row.row}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.curp}</td>
                    <td className="px-3 py-2">{row.studentName || "—"}</td>
                    <td className="px-3 py-2">
                      {row.status === "created"
                        ? "Nuevo"
                        : row.status === "reused"
                          ? "Existente"
                          : row.status === "error"
                            ? "Error"
                            : row.status}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{row.certificateNumber ?? "—"}</td>
                    <td className="px-3 py-2 text-brand-muted">{row.message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
