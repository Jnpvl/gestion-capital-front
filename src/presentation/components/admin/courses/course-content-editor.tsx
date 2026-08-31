"use client";

import { useState } from "react";
import type {
  CourseSection,
  Lesson,
  LessonBlock,
  LessonBlockType,
} from "@/core/domain/courses/types";
import { BLOCK_TYPE_LABELS } from "@/core/domain/courses/types";
import { createEmptyQuiz, serializeQuizContent } from "@/core/domain/courses/quiz";
import { QuizBlockEditor } from "@/presentation/components/admin/courses/quiz-block-editor";
import { CourseAssetUpload } from "@/presentation/components/admin/courses/course-asset-upload";

interface CourseContentEditorProps {
  courseId: string;
  sections: CourseSection[];
  isSaving: boolean;
  onSave: (sections: CourseSection[]) => Promise<void>;
}

function newBlock(type: LessonBlockType = "text"): LessonBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title: "",
    content: type === "quiz" ? serializeQuizContent(createEmptyQuiz()) : "",
    resourceUrl: "",
    sortOrder: 0,
  };
}

function newLesson(): Lesson {
  return {
    id: crypto.randomUUID(),
    title: "Nueva clase",
    sortOrder: 0,
    blocks: [newBlock()],
  };
}

function newSection(): CourseSection {
  return {
    id: crypto.randomUUID(),
    title: "Nueva sección",
    sortOrder: 0,
    lessons: [],
  };
}

function LessonEditor({
  courseId,
  lesson,
  lessonIndex,
  totalLessons,
  onUpdate,
  onRemove,
  onMove,
}: {
  courseId: string;
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  onUpdate: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  function updateBlock(blockIndex: number, patch: Partial<LessonBlock>) {
    onUpdate({
      blocks: lesson.blocks.map((block, index) =>
        index === blockIndex ? { ...block, ...patch } : block,
      ),
    });
  }

  function removeBlock(blockIndex: number) {
    onUpdate({ blocks: lesson.blocks.filter((_, index) => index !== blockIndex) });
  }

  function addBlock(type: LessonBlockType) {
    onUpdate({ blocks: [...lesson.blocks, newBlock(type)] });
  }

  return (
    <div className="rounded-xl border border-brand-line bg-brand-light/20 p-4">
      <div className="flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Clase {lessonIndex + 1}
          </label>
          <input
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-blue"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={lessonIndex === 0}
            className="rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-medium disabled:opacity-40"
          >
            Subir
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={lessonIndex === totalLessons - 1}
            className="rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-medium disabled:opacity-40"
          >
            Bajar
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Eliminar clase
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {lesson.blocks.map((block, blockIndex) => (
          <div key={block.id} className="rounded-xl border border-brand-line bg-white p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <select
                value={block.type}
                onChange={(e) => {
                  const type = e.target.value as LessonBlockType;
                  const switchingToQuiz = type === "quiz" && block.type !== "quiz";
                  updateBlock(blockIndex, {
                    type,
                    content: switchingToQuiz
                      ? serializeQuizContent(createEmptyQuiz())
                      : block.content,
                  });
                }}
                className="rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
              >
                {(Object.keys(BLOCK_TYPE_LABELS) as LessonBlockType[]).map((type) => (
                  <option key={type} value={type}>
                    {BLOCK_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeBlock(blockIndex)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Quitar bloque
              </button>
            </div>

            <input
              value={block.title ?? ""}
              onChange={(e) => updateBlock(blockIndex, { title: e.target.value })}
              placeholder="Título del bloque (opcional)"
              className="mb-3 w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />

            {block.type === "video" && (
              <div className="space-y-2">
                <input
                  value={block.resourceUrl ?? ""}
                  onChange={(e) => updateBlock(blockIndex, { resourceUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                />
                <p className="text-xs text-brand-muted">
                  Pega el enlace de YouTube. El video se mostrará embebido en la vista del alumno.
                </p>
              </div>
            )}

            {(block.type === "file" || block.type === "presentation") && (
              <CourseAssetUpload
                courseId={courseId}
                kind="pdf"
                value={block.resourceUrl || null}
                onChange={(path) => updateBlock(blockIndex, { resourceUrl: path })}
                label={block.type === "presentation" ? "Presentación en PDF" : "Archivo PDF"}
                hint="Se guardará en uploads/files/cursos/{slug}/ del servidor."
                accept="application/pdf"
              />
            )}

            {block.type === "image" && (
              <CourseAssetUpload
                courseId={courseId}
                kind="image"
                value={block.resourceUrl || null}
                onChange={(path) => updateBlock(blockIndex, { resourceUrl: path })}
                label="Imagen de la clase"
                hint="Se guardará en uploads/images/cursos/{slug}/ del servidor."
                accept="image/jpeg,image/png,image/webp,image/gif"
              />
            )}

            {block.type === "quiz" ? (
              <QuizBlockEditor
                content={block.content}
                onChange={(content) => updateBlock(blockIndex, { content })}
              />
            ) : block.type === "text" ? (
              <textarea
                value={block.content ?? ""}
                onChange={(e) => updateBlock(blockIndex, { content: e.target.value })}
                rows={5}
                placeholder="Contenido en texto"
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_TYPE_LABELS) as LessonBlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="rounded-full border border-brand-line bg-white px-3 py-1.5 text-xs font-medium text-brand-gray hover:bg-brand-light"
          >
            + {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CourseContentEditor({
  courseId,
  sections: initialSections,
  isSaving,
  onSave,
}: CourseContentEditorProps) {
  const [sections, setSections] = useState<CourseSection[]>(
    initialSections.length > 0 ? initialSections : [],
  );

  function updateSection(sectionIndex: number, patch: Partial<CourseSection>) {
    setSections((prev) =>
      prev.map((section, index) => (index === sectionIndex ? { ...section, ...patch } : section)),
    );
  }

  function removeSection(sectionIndex: number) {
    setSections((prev) => prev.filter((_, index) => index !== sectionIndex));
  }

  function moveSection(sectionIndex: number, direction: -1 | 1) {
    const next = sectionIndex + direction;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      [copy[sectionIndex], copy[next]] = [copy[next], copy[sectionIndex]];
      return copy;
    });
  }

  function updateLesson(sectionIndex: number, lessonIndex: number, patch: Partial<Lesson>) {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, li) =>
                li === lessonIndex ? { ...lesson, ...patch } : lesson,
              ),
            }
          : section,
      ),
    );
  }

  function removeLesson(sectionIndex: number, lessonIndex: number) {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? { ...section, lessons: section.lessons.filter((_, li) => li !== lessonIndex) }
          : section,
      ),
    );
  }

  function moveLesson(sectionIndex: number, lessonIndex: number, direction: -1 | 1) {
    const next = lessonIndex + direction;
    const section = sections[sectionIndex];
    if (!section || next < 0 || next >= section.lessons.length) return;

    setSections((prev) =>
      prev.map((item, index) => {
        if (index !== sectionIndex) return item;
        const lessons = [...item.lessons];
        [lessons[lessonIndex], lessons[next]] = [lessons[next], lessons[lessonIndex]];
        return { ...item, lessons };
      }),
    );
  }

  return (
    <div className="space-y-6">
      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 p-8 text-center text-sm text-brand-muted">
          Aún no hay secciones. Agrega la primera para organizar el contenido del curso.
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="rounded-2xl border border-brand-line bg-white p-5">
          <div className="flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-blue">
                Sección {sectionIndex + 1}
              </label>
              <input
                value={section.title}
                onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-blue"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveSection(sectionIndex, -1)}
                disabled={sectionIndex === 0}
                className="rounded-lg border border-brand-line px-3 py-2 text-xs font-medium disabled:opacity-40"
              >
                Subir
              </button>
              <button
                type="button"
                onClick={() => moveSection(sectionIndex, 1)}
                disabled={sectionIndex === sections.length - 1}
                className="rounded-lg border border-brand-line px-3 py-2 text-xs font-medium disabled:opacity-40"
              >
                Bajar
              </button>
              <button
                type="button"
                onClick={() => removeSection(sectionIndex)}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Eliminar sección
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {section.lessons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-6 text-center text-sm text-brand-muted">
                Esta sección no tiene clases todavía.
              </p>
            ) : (
              section.lessons.map((lesson, lessonIndex) => (
                <LessonEditor
                  key={lesson.id}
                  courseId={courseId}
                  lesson={lesson}
                  lessonIndex={lessonIndex}
                  totalLessons={section.lessons.length}
                  onUpdate={(patch) => updateLesson(sectionIndex, lessonIndex, patch)}
                  onRemove={() => removeLesson(sectionIndex, lessonIndex)}
                  onMove={(direction) => moveLesson(sectionIndex, lessonIndex, direction)}
                />
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              updateSection(sectionIndex, { lessons: [...section.lessons, newLesson()] })
            }
            className="mt-4 rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            Agregar clase a esta sección
          </button>
        </div>
      ))}

      <div className="flex flex-col gap-3 border-t border-brand-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setSections((prev) => [...prev, newSection()])}
          className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
        >
          Agregar sección
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void onSave(sections)}
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar contenido"}
        </button>
      </div>
    </div>
  );
}
