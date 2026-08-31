"use client";

import { useState } from "react";
import type { CourseDetail, CourseModality, CourseStatus } from "@/core/domain/courses/types";
import { MODALITY_LABELS } from "@/core/domain/courses/types";
import { CourseAssetUpload } from "@/presentation/components/admin/courses/course-asset-upload";

interface CoursePromotionFormProps {
  course: CourseDetail;
  isSaving: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export function CoursePromotionForm({ course, isSaving, onSave }: CoursePromotionFormProps) {
  const [coverImage, setCoverImage] = useState(course.coverImage ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const highlightsRaw = String(form.get("highlights") ?? "");
    const highlights = highlightsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await onSave({
      title: String(form.get("title") ?? "").trim(),
      slug: String(form.get("slug") ?? "").trim() || undefined,
      shortDescription: String(form.get("shortDescription") ?? "").trim() || null,
      description: String(form.get("description") ?? "").trim() || null,
      coverImage: coverImage.trim() || null,
      modality: (String(form.get("modality") ?? "") || null) as CourseModality | null,
      duration: String(form.get("duration") ?? "").trim() || null,
      level: String(form.get("level") ?? "").trim() || null,
      highlights,
      status: String(form.get("status") ?? "draft") as CourseStatus,
      showInCatalog: form.get("showInCatalog") === "on",
      featured: form.get("featured") === "on",
    });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Título
            </label>
            <input
              id="title"
              name="title"
              defaultValue={course.title}
              required
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Slug (URL)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={course.slug}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
            <p className="mt-1 text-xs text-brand-muted">
              Se usará en /cursos/{course.slug} y en uploads/images/cursos/{course.slug}/
            </p>
          </div>

          <div>
            <label htmlFor="shortDescription" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Descripción corta
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={3}
              defaultValue={course.shortDescription ?? ""}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Descripción completa
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={course.description ?? ""}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="space-y-4">
          <CourseAssetUpload
            courseId={course.id}
            kind="image"
            value={coverImage || null}
            onChange={setCoverImage}
            label="Imagen de portada"
            hint="Se guardará en uploads/images/cursos/{slug}/ del servidor."
            accept="image/jpeg,image/png,image/webp,image/gif"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="modality" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Modalidad
              </label>
              <select
                id="modality"
                name="modality"
                defaultValue={course.modality ?? ""}
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              >
                <option value="">Sin especificar</option>
                {(Object.keys(MODALITY_LABELS) as CourseModality[]).map((key) => (
                  <option key={key} value={key}>
                    {MODALITY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Duración
              </label>
              <input
                id="duration"
                name="duration"
                defaultValue={course.duration ?? ""}
                placeholder="Ej. 8 horas"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Nivel
            </label>
            <input
              id="level"
              name="level"
              defaultValue={course.level ?? ""}
              placeholder="Ej. Básico, Intermedio"
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label htmlFor="highlights" className="mb-1.5 block text-sm font-medium text-brand-gray">
              Puntos destacados (uno por línea)
            </label>
            <textarea
              id="highlights"
              name="highlights"
              rows={5}
              defaultValue={course.highlights.join("\n")}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-brand-line bg-brand-light/50 p-4">
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={course.status}
                className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-brand-gray">
              <input
                type="checkbox"
                name="showInCatalog"
                defaultChecked={course.showInCatalog}
                className="rounded border-brand-line"
              />
              Mostrar en catálogo público
            </label>

            <label className="flex items-center gap-2 text-sm text-brand-gray">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={course.featured}
                className="rounded border-brand-line"
              />
              Destacar en inicio
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-brand-line pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar promoción"}
        </button>
      </div>
    </form>
  );
}
