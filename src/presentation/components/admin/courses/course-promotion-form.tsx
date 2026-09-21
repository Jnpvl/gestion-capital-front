"use client";

import { useMemo, useState } from "react";
import type {
  CourseDetail,
  CourseModality,
  CourseObjectiveItem,
  CourseObjectives,
  CourseParticipantProfile,
  CoursePublicDetail,
  CourseStatus,
  CourseSyllabusUnit,
} from "@/core/domain/courses/types";
import {
  EMPTY_OBJECTIVES,
  EMPTY_PARTICIPANT_PROFILE,
  MODALITY_LABELS,
  normalizeObjectives,
  normalizeParticipantProfile,
  normalizeSyllabus,
} from "@/core/domain/courses/types";
import { CourseAssetUpload } from "@/presentation/components/admin/courses/course-asset-upload";
import { CoursePublicView } from "@/presentation/components/courses/course-public-view";
import { StpsThematicAreaField } from "@/presentation/components/admin/students/stps-thematic-area-field";

interface CoursePromotionFormProps {
  course: CourseDetail;
  isSaving: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CoursePromotionForm({ course, isSaving, onSave }: CoursePromotionFormProps) {
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [shortDescription, setShortDescription] = useState(course.shortDescription ?? "");
  const [description, setDescription] = useState(course.description ?? "");
  const [coverImage, setCoverImage] = useState(course.coverImage ?? "");
  const [modality, setModality] = useState(course.modality ?? "");
  const [duration, setDuration] = useState(course.duration ?? "");
  const [level, setLevel] = useState(course.level ?? "");
  const [period, setPeriod] = useState(course.period ?? "");
  const [location, setLocation] = useState(course.location ?? "");
  const [highlightsText, setHighlightsText] = useState(course.highlights.join("\n"));
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [showInCatalog, setShowInCatalog] = useState(course.showInCatalog);
  const [stpsThematicAreaCode, setStpsThematicAreaCode] = useState(
    course.stpsThematicAreaCode ?? "",
  );
  const [stpsThematicAreaLabel, setStpsThematicAreaLabel] = useState(
    course.stpsThematicAreaName ?? "",
  );

  const [participantProfile, setParticipantProfile] = useState<CourseParticipantProfile>(
    normalizeParticipantProfile(course.participantProfile ?? EMPTY_PARTICIPANT_PROFILE),
  );
  const [objectives, setObjectives] = useState<CourseObjectives>(() => {
    const normalized = normalizeObjectives(course.objectives ?? EMPTY_OBJECTIVES);
    return {
      general: normalized.general,
      items:
        normalized.items.length > 0
          ? normalized.items
          : [{ label: "", text: "" }],
    };
  });
  const [syllabus, setSyllabus] = useState<CourseSyllabusUnit[]>(() => {
    const normalized = normalizeSyllabus(course.syllabus ?? []);
    return normalized.length > 0 ? normalized : [{ title: "", topics: [] }];
  });
  const [syllabusTopicsText, setSyllabusTopicsText] = useState<string[]>(() => {
    const normalized = normalizeSyllabus(course.syllabus ?? []);
    const units = normalized.length > 0 ? normalized : [{ title: "", topics: [] }];
    return units.map((unit) => unit.topics.join("\n"));
  });

  const previewCourse = useMemo<CoursePublicDetail>(() => {
    const cleanedObjectives = normalizeObjectives({
      general: objectives.general,
      items: objectives.items.filter((item) => item.text.trim()),
    });
    const cleanedSyllabus = normalizeSyllabus(
      syllabus.map((unit, index) => ({
        title: unit.title,
        topics: linesToList(syllabusTopicsText[index] ?? ""),
      })),
    );

    return {
      id: course.id,
      title: title.trim() || "Título del curso",
      slug: slug.trim() || course.slug,
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
      modality: modality || null,
      duration: duration.trim() || null,
      level: level.trim() || null,
      featured: course.featured,
      highlights: linesToList(highlightsText),
      participantProfile: normalizeParticipantProfile(participantProfile),
      objectives: cleanedObjectives,
      syllabus: cleanedSyllabus,
    };
  }, [
    course.featured,
    course.id,
    course.slug,
    coverImage,
    description,
    duration,
    highlightsText,
    level,
    modality,
    objectives,
    participantProfile,
    shortDescription,
    slug,
    syllabus,
    syllabusTopicsText,
    title,
  ]);

  function updateObjectiveItem(index: number, patch: Partial<CourseObjectiveItem>) {
    setObjectives((current) => ({
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateSyllabusUnit(index: number, patch: Partial<CourseSyllabusUnit>) {
    setSyllabus((current) =>
      current.map((unit, i) => (i === index ? { ...unit, ...patch } : unit)),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanedObjectives = normalizeObjectives({
      general: objectives.general,
      items: objectives.items.filter((item) => item.text.trim()),
    });
    const cleanedSyllabus = normalizeSyllabus(
      syllabus.map((unit, index) => ({
        title: unit.title,
        topics: linesToList(syllabusTopicsText[index] ?? ""),
      })),
    );

    await onSave({
      title: title.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
      modality: (modality || null) as CourseModality | null,
      duration: duration.trim() || null,
      period: period.trim() || null,
      location: location.trim() || null,
      stpsThematicAreaCode: stpsThematicAreaCode.trim() || null,
      level: level.trim() || null,
      highlights: linesToList(highlightsText),
      participantProfile: normalizeParticipantProfile(participantProfile),
      objectives: cleanedObjectives,
      syllabus: cleanedSyllabus,
      status,
      showInCatalog,
    });
  }

  return (
    <div className="space-y-10">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Contenido</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Título, URL e información visible en el catálogo.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-brand-gray">
                    Título
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-brand-gray">
                    Slug (URL)
                  </label>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                  />
                  <p className="mt-1 text-xs text-brand-muted">
                    Se usará en /cursos/{slug || course.slug}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="shortDescription"
                  className="mb-1.5 block text-sm font-medium text-brand-gray"
                >
                  Descripción corta
                </label>
                <textarea
                  id="shortDescription"
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-brand-gray"
                >
                  Descripción completa
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumen del curso (sin perfil ni temario)."
                  className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <CourseAssetUpload
              courseId={course.id}
              kind="image"
              value={coverImage || null}
              onChange={setCoverImage}
              label="Imagen de portada"
              hint="Se guardará en uploads/images/cursos/{slug}/ del servidor."
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-line pt-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">¿A quién va dirigido?</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Perfil del participante. Cada bloque se muestra por separado en el sitio.
            </p>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                Psicográficas
              </label>
              <textarea
                rows={3}
                value={participantProfile.psychographics}
                onChange={(e) =>
                  setParticipantProfile((current) => ({
                    ...current,
                    psychographics: e.target.value,
                  }))
                }
                placeholder="Público, roles, edad, disposición..."
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-gray">
                Conocimientos
              </label>
              <textarea
                rows={3}
                value={participantProfile.knowledge}
                onChange={(e) =>
                  setParticipantProfile((current) => ({
                    ...current,
                    knowledge: e.target.value,
                  }))
                }
                placeholder="Conocimientos previos recomendados..."
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-gray">Habilidades</label>
              <textarea
                rows={3}
                value={participantProfile.skills}
                onChange={(e) =>
                  setParticipantProfile((current) => ({
                    ...current,
                    skills: e.target.value,
                  }))
                }
                placeholder="Habilidades que se requieren o se esperan..."
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-line pt-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Objetivos</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Objetivo general y objetivos específicos (cognitivo, psicomotor, etc.).
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Objetivo general
            </label>
            <textarea
              rows={4}
              value={objectives.general}
              onChange={(e) =>
                setObjectives((current) => ({ ...current, general: e.target.value }))
              }
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div className="space-y-3">
            {objectives.items.map((item, index) => (
              <div
                key={`objective-${index}`}
                className="grid gap-3 rounded-xl border border-brand-line p-4 sm:grid-cols-[160px_minmax(0,1fr)_auto]"
              >
                <input
                  value={item.label}
                  onChange={(e) => updateObjectiveItem(index, { label: e.target.value })}
                  placeholder="Etiqueta"
                  className="rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                />
                <textarea
                  rows={3}
                  value={item.text}
                  onChange={(e) => updateObjectiveItem(index, { text: e.target.value })}
                  placeholder="Texto del objetivo"
                  className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                />
                <button
                  type="button"
                  onClick={() =>
                    setObjectives((current) => ({
                      ...current,
                      items:
                        current.items.length <= 1
                          ? [{ label: "", text: "" }]
                          : current.items.filter((_, i) => i !== index),
                    }))
                  }
                  className="h-fit rounded-lg border border-brand-line px-3 py-2 text-xs font-medium text-brand-muted hover:bg-brand-light"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setObjectives((current) => ({
                  ...current,
                  items: [...current.items, { label: "", text: "" }],
                }))
              }
              className="rounded-lg border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-blue hover:bg-brand-light"
            >
              + Agregar objetivo
            </button>
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-line pt-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Temario</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Unidades y temas. Un tema por línea dentro de cada unidad.
            </p>
          </div>

          <div className="space-y-3">
            {syllabus.map((unit, index) => (
              <div key={`unit-${index}`} className="space-y-3 rounded-xl border border-brand-line p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={unit.title}
                    onChange={(e) => updateSyllabusUnit(index, { title: e.target.value })}
                    placeholder={`Unidad ${index + 1}: título`}
                    className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (syllabus.length <= 1) {
                        setSyllabus([{ title: "", topics: [] }]);
                        setSyllabusTopicsText([""]);
                        return;
                      }
                      setSyllabus((current) => current.filter((_, i) => i !== index));
                      setSyllabusTopicsText((current) => current.filter((_, i) => i !== index));
                    }}
                    className="shrink-0 rounded-lg border border-brand-line px-3 py-2 text-xs font-medium text-brand-muted hover:bg-brand-light"
                  >
                    Quitar unidad
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={syllabusTopicsText[index] ?? ""}
                  onChange={(e) =>
                    setSyllabusTopicsText((current) =>
                      current.map((value, i) => (i === index ? e.target.value : value)),
                    )
                  }
                  placeholder={"1.1 Tema uno\n1.2 Tema dos"}
                  className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setSyllabus((current) => [...current, { title: "", topics: [] }]);
                setSyllabusTopicsText((current) => [...current, ""]);
              }}
              className="rounded-lg border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-blue hover:bg-brand-light"
            >
              + Agregar unidad
            </button>
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-line pt-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Datos del curso</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Información operativa, constancias y DC-3.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="modality" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Modalidad
              </label>
              <select
                id="modality"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
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
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ej. 8 horas"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Nivel
              </label>
              <input
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Ej. Básico, Intermedio"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="period" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Periodo del curso
              </label>
              <input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ej. 12 al 14 de marzo de 2026"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Lugar
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Hermosillo, Sonora"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <StpsThematicAreaField
                value={stpsThematicAreaCode}
                selectedLabel={stpsThematicAreaLabel || null}
                onChange={(code, label) => {
                  setStpsThematicAreaCode(code);
                  setStpsThematicAreaLabel(label);
                }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-line pt-8">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Catálogo y publicación</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Beneficios cortos (marketing) y visibilidad pública.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <label htmlFor="highlights" className="mb-1.5 block text-sm font-medium text-brand-gray">
                Lo que aprenderás (uno por línea)
              </label>
              <textarea
                id="highlights"
                rows={6}
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                placeholder={"Identificar factores de riesgo\nAplicar guías de referencia"}
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
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CourseStatus)}
                  className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-brand-gray">
                <input
                  type="checkbox"
                  checked={showInCatalog}
                  onChange={(e) => setShowInCatalog(e.target.checked)}
                  className="rounded border-brand-line"
                />
                Mostrar en catálogo público
              </label>
            </div>
          </div>
        </section>

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

      <section className="space-y-3 border-t border-brand-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Vista previa del sitio</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Se actualiza mientras editas. Guarda para publicarla en el sitio.
            </p>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-muted">
            Preview en vivo
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-light/30 p-2 sm:p-4">
          <CoursePublicView course={previewCourse} preview />
        </div>
      </section>
    </div>
  );
}
