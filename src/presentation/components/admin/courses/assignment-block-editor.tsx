"use client";

import {
  parseAssignmentContent,
  serializeAssignmentContent,
} from "@/core/domain/courses/assignment";
import { CourseAssetUpload } from "@/presentation/components/admin/courses/course-asset-upload";

interface AssignmentBlockEditorProps {
  courseId: string;
  content: string | null | undefined;
  resourceUrl: string | null | undefined;
  onChangeContent: (content: string) => void;
  onChangeResourceUrl: (path: string) => void;
}

export function AssignmentBlockEditor({
  courseId,
  content,
  resourceUrl,
  onChangeContent,
  onChangeResourceUrl,
}: AssignmentBlockEditorProps) {
  const parsed = parseAssignmentContent(content);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray">
          Instrucciones para el alumno
        </label>
        <textarea
          value={parsed.instructions}
          onChange={(e) =>
            onChangeContent(
              serializeAssignmentContent({
                ...parsed,
                instructions: e.target.value,
              }),
            )
          }
          rows={5}
          placeholder="Describe qué debe entregar el alumno..."
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-gray">
        <input
          type="checkbox"
          checked={parsed.required}
          onChange={(e) =>
            onChangeContent(
              serializeAssignmentContent({
                ...parsed,
                required: e.target.checked,
              }),
            )
          }
          className="rounded border-brand-line"
        />
        Obligatoria para completar la clase / constancia
      </label>

      <CourseAssetUpload
        courseId={courseId}
        kind="pdf"
        value={resourceUrl || null}
        onChange={onChangeResourceUrl}
        label="Archivo de apoyo (opcional)"
        hint="Consigna o formato en PDF. Se guarda en uploads/files/cursos/{slug}/."
        accept="application/pdf"
      />
    </div>
  );
}
