"use client";

import { useState } from "react";
import type { CourseDetail } from "@/core/domain/courses/types";
import { CertificatePreview } from "@/presentation/components/admin/courses/certificate-preview";
import { FIXED_CONSTANCIA_TEMPLATE_PATH, FIXED_DC3_TEMPLATE_PATH } from "@/shared/content/certificate-template";
import { cn } from "@/shared/lib/cn";

type TemplateKind = "certificate" | "dc3";

interface CourseTemplatesFormProps {
  course: CourseDetail;
  isSaving: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export function CourseTemplatesForm({ course }: CourseTemplatesFormProps) {
  const [kind, setKind] = useState<TemplateKind>("certificate");
  const isCertificate = kind === "certificate";
  const templateUrl = isCertificate ? FIXED_CONSTANCIA_TEMPLATE_PATH : FIXED_DC3_TEMPLATE_PATH;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-gray">Plantillas y constancias</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Constancia y DC-3 usan el formato oficial fijo de Gestiona Capital Humano / STPS.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setKind("certificate")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium",
            isCertificate ? "bg-brand-blue text-white" : "bg-brand-light text-brand-gray",
          )}
        >
          Constancia
        </button>
        <button
          type="button"
          onClick={() => setKind("dc3")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium",
            !isCertificate ? "bg-brand-blue text-white" : "bg-brand-light text-brand-gray",
          )}
        >
          DC3
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:items-start">
        <div className="space-y-5">
          {isCertificate ? (
            <div className="rounded-xl border border-brand-line bg-brand-light/50 p-4 text-sm text-brand-muted">
              Esta plantilla es fija para todos los cursos. Nombre, CURP, curso, duración, modalidad y
              periodo son de ejemplo en la vista previa. El instructor usa los datos del staff que
              creó el curso. El QR queda ligado al folio.
            </div>
          ) : (
            <div className="rounded-xl border border-brand-line bg-brand-light/50 p-4 text-sm text-brand-muted">
              Formato oficial DC-3 (anverso y reverso). Se llena con datos del alumno, empresa, CURP,
              RFC, ocupación STPS, duración, periodo de inscripción y el área temática de Promoción.
              El agente capacitador es quien creó el curso y su registro ACE STPS. El QR junto al
              logo abre la misma verificación que la constancia del alumno. Solo aplica a
              alumnos inscritos con empresa.
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-3 text-sm font-medium text-brand-gray">
            Vista previa {isCertificate ? "constancia" : "DC3"}
          </p>
          <CertificatePreview
            courseId={course.id}
            courseTitle={course.title}
            templateUrl={templateUrl}
            variant={kind}
            course={course}
          />
        </div>
      </div>
    </div>
  );
}
