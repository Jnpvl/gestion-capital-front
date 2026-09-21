"use client";

import { useState } from "react";
import type {
  CourseSection,
  Lesson,
  LessonBlock,
  LessonBlockType,
} from "@/core/domain/courses/types";
import { BLOCK_TYPE_LABELS } from "@/core/domain/courses/types";
import { createEmptyQuiz, createQuizQuestion, serializeQuizContent } from "@/core/domain/courses/quiz";
import {
  createEmptyAssignmentContent,
  serializeAssignmentContent,
} from "@/core/domain/courses/assignment";
import { QuizBlockEditor } from "@/presentation/components/admin/courses/quiz-block-editor";
import { AssignmentBlockEditor } from "@/presentation/components/admin/courses/assignment-block-editor";
import { CourseAssetUpload } from "@/presentation/components/admin/courses/course-asset-upload";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { deleteUploadedAsset } from "@/infrastructure/http/uploads-api";
import { cn } from "@/shared/lib/cn";

const MEDIA_BLOCK_TYPES = new Set<LessonBlockType>([
  "image",
  "file",
  "presentation",
  "assignment",
]);

function collectLessonUploadPaths(lesson: Lesson): string[] {
  return lesson.blocks
    .map((block) => block.resourceUrl?.trim())
    .filter((path): path is string => Boolean(path));
}

function collectSectionUploadPaths(section: CourseSection): string[] {
  return section.lessons.flatMap(collectLessonUploadPaths);
}

/** Best-effort delete of managed /uploads files when a block/lesson/section is removed. */
function purgeUploadPaths(paths: Array<string | null | undefined>) {
  const token = authStorage.getToken();
  if (!token) return;

  const unique = [
    ...new Set(
      paths
        .map((path) => path?.trim())
        .filter((path): path is string => Boolean(path)),
    ),
  ];

  for (const path of unique) {
    void deleteUploadedAsset(token, path).catch(() => undefined);
  }
}

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
    content:
      type === "quiz"
        ? serializeQuizContent(createEmptyQuiz())
        : type === "assignment"
          ? serializeAssignmentContent(createEmptyAssignmentContent())
          : "",
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
    isFinalExam: false,
    lessons: [],
  };
}

function newFinalExamSection(): CourseSection {
  return {
    id: crypto.randomUUID(),
    title: "Examen final",
    sortOrder: 0,
    isFinalExam: true,
    lessons: [
      {
        id: crypto.randomUUID(),
        title: "Examen final",
        sortOrder: 0,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "quiz",
            title: "Examen final",
            content: serializeQuizContent({
              instructions:
                "Responde todas las preguntas del examen final. Debes obtener al menos 80% para aprobar.",
              questions: [createQuizQuestion()],
            }),
            resourceUrl: "",
            sortOrder: 0,
          },
        ],
      },
    ],
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
    const block = lesson.blocks[blockIndex];
    purgeUploadPaths([block?.resourceUrl]);
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
                  const switchingToAssignment =
                    type === "assignment" && block.type !== "assignment";
                  const leavingMedia =
                    MEDIA_BLOCK_TYPES.has(block.type) && type !== block.type;

                  if (leavingMedia) {
                    purgeUploadPaths([block.resourceUrl]);
                  }

                  updateBlock(blockIndex, {
                    type,
                    content: switchingToQuiz
                      ? serializeQuizContent(createEmptyQuiz())
                      : switchingToAssignment
                        ? serializeAssignmentContent(createEmptyAssignmentContent())
                        : block.content,
                    ...(leavingMedia ? { resourceUrl: "" } : {}),
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
            ) : block.type === "assignment" ? (
              <AssignmentBlockEditor
                courseId={courseId}
                content={block.content}
                resourceUrl={block.resourceUrl}
                onChangeContent={(content) => updateBlock(blockIndex, { content })}
                onChangeResourceUrl={(path) =>
                  updateBlock(blockIndex, { resourceUrl: path })
                }
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
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(() => new Set());

  const hasFinalExam = sections.some((section) => section.isFinalExam);

  function focusSection(sectionId: string) {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      for (const item of sections) next.add(item.id);
      next.delete(sectionId);
      return next;
    });
  }

  function isSectionCollapsed(sectionId: string) {
    return collapsedSectionIds.has(sectionId);
  }

  function toggleSectionCollapsed(sectionId: string) {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function expandAllSections() {
    setCollapsedSectionIds(new Set());
  }

  function collapseAllSections() {
    setCollapsedSectionIds(new Set(sections.map((section) => section.id)));
  }

  function updateFinalExamQuiz(sectionIndex: number, content: string) {
    setSections((prev) =>
      prev.map((section, index) => {
        if (index !== sectionIndex || !section.isFinalExam) return section;

        const lesson = section.lessons[0] ?? {
          id: crypto.randomUUID(),
          title: "Examen final",
          sortOrder: 0,
          blocks: [],
        };
        const block = lesson.blocks[0] ?? {
          ...newBlock("quiz"),
          title: "Examen final",
        };

        return {
          ...section,
          lessons: [
            {
              ...lesson,
              blocks: [{ ...block, type: "quiz", content }],
            },
          ],
        };
      }),
    );
  }

  function updateSection(sectionIndex: number, patch: Partial<CourseSection>) {
    setSections((prev) =>
      prev.map((section, index) => (index === sectionIndex ? { ...section, ...patch } : section)),
    );
  }

  function removeSection(sectionIndex: number) {
    const section = sections[sectionIndex];
    if (section) purgeUploadPaths(collectSectionUploadPaths(section));
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
    const lesson = sections[sectionIndex]?.lessons[lessonIndex];
    if (lesson) purgeUploadPaths(collectLessonUploadPaths(lesson));
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
      {sections.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 rounded-xl border border-brand-line bg-brand-light/40 p-4">
          <button
            type="button"
            onClick={expandAllSections}
            className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            Expandir todas
          </button>
          <button
            type="button"
            onClick={collapseAllSections}
            className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            Colapsar todas
          </button>
        </div>
      )}

      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 p-8 text-center text-sm text-brand-muted">
          Aún no hay secciones. Agrega la primera para organizar el contenido del curso.
        </div>
      )}

      {sections.map((section, sectionIndex) => {
        const isCollapsed = isSectionCollapsed(section.id);
        const isFinalExam = Boolean(section.isFinalExam);

        return (
        <div
          key={section.id}
          className={cn(
            "rounded-2xl border p-5",
            isFinalExam ? "border-amber-200 bg-amber-50/40" : "border-brand-line bg-white",
          )}
        >
          <div className="flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <button
                type="button"
                onClick={() => toggleSectionCollapsed(section.id)}
                className="mt-7 shrink-0 rounded-lg border border-brand-line p-2 text-brand-muted hover:bg-brand-light hover:text-brand-gray"
                aria-label={isCollapsed ? "Expandir sección" : "Colapsar sección"}
                aria-expanded={!isCollapsed}
              >
                <svg
                  className={cn("h-4 w-4 transition-transform", isCollapsed && "-rotate-90")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {isFinalExam ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Examen final
                    </span>
                  ) : (
                    <label className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                      Sección {sectionIndex + 1}
                    </label>
                  )}
                  {isCollapsed && !isFinalExam && (
                    <span className="text-xs text-brand-muted">
                      {section.lessons.length}{" "}
                      {section.lessons.length === 1 ? "clase" : "clases"}
                    </span>
                  )}
                </div>
                <input
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                  className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-blue"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:pt-6">
              {!isFinalExam && (
                <>
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
                </>
              )}
              <button
                type="button"
                onClick={() => removeSection(sectionIndex)}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                {isFinalExam ? "Eliminar examen" : "Eliminar sección"}
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <>
          {isFinalExam ? (
            <div className="mt-4">
              <QuizBlockEditor
                variant="final"
                content={section.lessons[0]?.blocks[0]?.content ?? null}
                onChange={(content) => updateFinalExamQuiz(sectionIndex, content)}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
            </>
          )}
        </div>
        );
      })}

      <div className="flex flex-col gap-3 border-t border-brand-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const section = newSection();
              setSections((prev) => [...prev, section]);
              focusSection(section.id);
            }}
            className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
          >
            Agregar sección
          </button>
          <button
            type="button"
            disabled={hasFinalExam}
            title={hasFinalExam ? "Este curso ya tiene un examen final" : undefined}
            onClick={() => {
              const section = newFinalExamSection();
              setSections((prev) => [...prev, section]);
              focusSection(section.id);
            }}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar examen final
          </button>
        </div>

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
