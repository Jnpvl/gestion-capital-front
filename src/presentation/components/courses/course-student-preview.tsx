"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CourseDetail, Lesson } from "@/core/domain/courses/types";
import { countCourseLessons, DEFAULT_COVER_IMAGE } from "@/core/domain/courses/types";
import type {
  CourseProgress,
  SaveCourseProgressInput,
} from "@/core/domain/student/progress.types";
import { LessonBlockStudentView } from "@/presentation/components/courses/lesson-block-student-view";
import { cn } from "@/shared/lib/cn";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

interface CourseStudentPreviewProps {
  course: CourseDetail;
  mode?: "preview" | "classroom";
  progress?: CourseProgress | null;
  onSaveProgress?: (input: SaveCourseProgressInput) => Promise<CourseProgress | void>;
}

interface PreviewLesson {
  lesson: Lesson;
  sectionTitle: string;
  globalIndex: number;
}

function buildProgressMaps(progress: CourseProgress | null | undefined) {
  const lessons = new Map(
    (progress?.lessons ?? []).map((item) => [item.lessonId, item] as const),
  );
  const blocks = new Map(
    (progress?.blocks ?? []).map((item) => [item.blockId, item] as const),
  );
  return { lessons, blocks };
}

export function CourseStudentPreview({
  course,
  mode = "preview",
  progress = null,
  onSaveProgress,
}: CourseStudentPreviewProps) {
  const previewLessons = useMemo<PreviewLesson[]>(() => {
    let index = 0;
    return course.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({
        lesson,
        sectionTitle: section.title,
        globalIndex: index++,
      })),
    );
  }, [course.sections]);

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [localProgress, setLocalProgress] = useState<CourseProgress | null>(progress);
  const hasRestoredLesson = useRef(false);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const progressMaps = useMemo(() => buildProgressMaps(localProgress), [localProgress]);

  useEffect(() => {
    if (mode !== "classroom" || hasRestoredLesson.current || previewLessons.length === 0) {
      return;
    }

    const lastLessonId = localProgress?.lastLessonId;
    if (lastLessonId) {
      const index = previewLessons.findIndex((item) => item.lesson.id === lastLessonId);
      if (index >= 0) {
        setSelectedLessonIndex(index);
      }
    }

    hasRestoredLesson.current = true;
  }, [localProgress?.lastLessonId, mode, previewLessons]);

  const selected = previewLessons[selectedLessonIndex] ?? null;
  const totalLessons = countCourseLessons(course);
  const completedCount = localProgress?.completedLessons ?? 0;
  const progressPercent =
    localProgress?.progressPercent ??
    (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  const persistProgress = useCallback(
    async (input: SaveCourseProgressInput) => {
      if (mode !== "classroom" || !onSaveProgress) return;

      const result = await onSaveProgress(input);
      if (result) {
        setLocalProgress(result);
      }
    },
    [mode, onSaveProgress],
  );

  const handleSelectLesson = useCallback(
    (index: number) => {
      setSelectedLessonIndex(index);
      const lesson = previewLessons[index]?.lesson;
      if (!lesson || mode !== "classroom") return;

      void persistProgress({
        lastLessonId: lesson.id,
        lessonUpdates: [{ lessonId: lesson.id, accessed: true }],
      });
    },
    [mode, persistProgress, previewLessons],
  );

  const handleCompleteLesson = useCallback(() => {
    const lesson = selected?.lesson;
    if (!lesson || mode !== "classroom") return;

    void persistProgress({
      lastLessonId: lesson.id,
      lessonUpdates: [{ lessonId: lesson.id, completed: true, accessed: true }],
    });
  }, [mode, persistProgress, selected?.lesson]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => progressMaps.lessons.get(lessonId)?.completed ?? false,
    [progressMaps.lessons],
  );

  return (
    <div className="space-y-4">
      {mode === "preview" && (
        <div className="flex flex-col gap-2 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-blue">Vista previa del alumno</p>
            <p className="text-xs text-brand-muted">
              Así verá el estudiante el curso en su aula. Refleja el contenido guardado.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-muted ring-1 ring-brand-line">
            Solo lectura
          </span>
        </div>
      )}

      {mode === "classroom" && totalLessons > 0 && (
        <div className="rounded-xl border border-brand-line bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-brand-gray">Progreso del curso</span>
            <span className="font-semibold text-brand-blue">{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-light">
            <div
              className="h-full rounded-full bg-brand-blue transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-brand-muted">
            {completedCount} de {totalLessons} clases completadas
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm">
        <div className="border-b border-brand-line bg-brand-gray px-4 py-3 text-white sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">Mi aula</p>
          <h2 className="mt-1 font-display text-lg font-bold sm:text-xl">{course.title}</h2>
        </div>

        {previewLessons.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-muted">
            El alumno aún no verá contenido. Agrega secciones y clases en la pestaña Contenido y guarda
            los cambios.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-brand-line bg-brand-light/50 lg:border-b-0 lg:border-r">
              <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Contenido del curso
              </p>
              <nav className="max-h-[420px] overflow-y-auto p-2 lg:max-h-none">
                <ul className="space-y-3">
                  {course.sections.map((section) => {
                    if (section.lessons.length === 0) return null;

                    return (
                      <li key={section.id}>
                        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
                          {section.title}
                        </p>
                        <ul className="space-y-1">
                          {section.lessons.map((lesson) => {
                            const previewIndex = previewLessons.findIndex(
                              (item) => item.lesson.id === lesson.id,
                            );
                            const isActive = previewIndex === selectedLessonIndex;
                            const isCompleted = isLessonCompleted(lesson.id);

                            return (
                              <li key={lesson.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectLesson(previewIndex)}
                                  className={cn(
                                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                    isActive
                                      ? "bg-white font-semibold text-brand-blue shadow-sm ring-1 ring-brand-line"
                                      : "text-brand-gray hover:bg-white/80",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                      isActive
                                        ? "bg-brand-blue text-white"
                                        : isCompleted
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-white text-brand-muted ring-1 ring-brand-line",
                                    )}
                                  >
                                    {isCompleted ? "✓" : previewIndex + 1}
                                  </span>
                                  <span className="line-clamp-2">{lesson.title}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <main className="min-w-0">
              {selected && (
                <>
                  <div className="relative aspect-[21/6] overflow-hidden bg-brand-light">
                    <Image
                      src={resolveAssetUrl(course.coverImage) || DEFAULT_COVER_IMAGE}
                      alt=""
                      fill
                      className="object-cover opacity-80"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-gray/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <p className="text-xs font-medium text-white/80">{selected.sectionTitle}</p>
                      <p className="mt-1 text-xs font-medium text-white/80">
                        Clase {selected.globalIndex + 1} de {totalLessons}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                        {selected.lesson.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-6">
                    {selected.lesson.blocks.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-8 text-center text-sm text-brand-muted">
                        Esta clase no tiene bloques de contenido todavía.
                      </p>
                    ) : (
                      selected.lesson.blocks.map((block, blockIndex) => (
                        <LessonBlockStudentView
                          key={block.id}
                          block={block}
                          index={blockIndex}
                          blockProgress={progressMaps.blocks.get(block.id)}
                          onBlockProgressChange={
                            mode === "classroom" && onSaveProgress
                              ? (update) => {
                                  void persistProgress({
                                    lastLessonId: selected.lesson.id,
                                    blockUpdates: [update],
                                  });
                                }
                              : undefined
                          }
                        />
                      ))
                    )}

                    {mode === "classroom" && (
                      <div className="flex flex-col gap-3 border-t border-brand-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-brand-muted">
                          {isLessonCompleted(selected.lesson.id)
                            ? "Has completado esta clase."
                            : "Cuando termines de revisar el contenido, marca la clase como completada."}
                        </p>
                        <button
                          type="button"
                          onClick={handleCompleteLesson}
                          disabled={isLessonCompleted(selected.lesson.id)}
                          className="rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:cursor-default disabled:bg-emerald-600 disabled:hover:bg-emerald-600"
                        >
                          {isLessonCompleted(selected.lesson.id)
                            ? "Clase completada"
                            : "Marcar clase como completada"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
