"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CourseDetail, Lesson } from "@/core/domain/courses/types";
import { findFinalExamInfo } from "@/core/domain/courses/final-exam";
import { countCourseLessons, DEFAULT_COVER_IMAGE } from "@/core/domain/courses/types";
import { parseAssignmentContent } from "@/core/domain/courses/assignment";
import type {
  CourseProgress,
  SaveCourseProgressInput,
} from "@/core/domain/student/progress.types";
import { LessonBlockStudentView } from "@/presentation/components/courses/lesson-block-student-view";
import { downloadCourseCertificate, downloadCourseDc3 } from "@/infrastructure/http/student-certificate-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
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
  sectionId: string;
  sectionTitle: string;
  isFinalExam: boolean;
  globalIndex: number;
}

function buildProgressMaps(progress: CourseProgress | null | undefined) {
  const lessons = new Map(
    (progress?.lessons ?? []).map((item) => [item.lessonId, item] as const),
  );
  const blocks = new Map(
    (progress?.blocks ?? []).map((item) => [item.blockId, item] as const),
  );
  const assignments = new Map(
    (progress?.assignments ?? []).map((item) => [item.blockId, item] as const),
  );
  return { lessons, blocks, assignments };
}

function lessonRequiredAssignmentsApproved(
  lesson: Lesson,
  assignments: Map<string, { status: string }>,
): boolean {
  const requiredBlocks = lesson.blocks.filter(
    (block) =>
      block.type === "assignment" && parseAssignmentContent(block.content).required,
  );
  return requiredBlocks.every(
    (block) => assignments.get(block.id)?.status === "approved",
  );
}

function allRequiredAssignmentsApproved(
  course: CourseDetail,
  assignments: Map<string, { status: string }>,
): boolean {
  return course.sections.every((section) =>
    section.lessons.every((lesson) =>
      lessonRequiredAssignmentsApproved(lesson, assignments),
    ),
  );
}

function lessonQuizzesPassed(
  lesson: Lesson,
  _isFinalExam: boolean,
  blocks: Map<string, { passed: boolean }>,
): boolean {
  const quizzes = lesson.blocks.filter((block) => block.type === "quiz");
  if (quizzes.length === 0) return true;
  return quizzes.every((block) => blocks.get(block.id)?.passed);
}

function allPracticeQuizzesPassed(
  course: CourseDetail,
  blocks: Map<string, { passed: boolean }>,
): boolean {
  return course.sections.every((section) => {
    if (section.isFinalExam) return true;
    return section.lessons.every((lesson) => lessonQuizzesPassed(lesson, false, blocks));
  });
}

export function CourseStudentPreview({
  course,
  mode = "preview",
  progress = null,
  onSaveProgress,
}: CourseStudentPreviewProps) {
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const [isDownloadingDc3, setIsDownloadingDc3] = useState(false);
  const finalExamInfo = useMemo(() => findFinalExamInfo(course), [course]);

  const previewLessons = useMemo<PreviewLesson[]>(() => {
    let index = 0;
    return course.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({
        lesson,
        sectionId: section.id,
        sectionTitle: section.title,
        isFinalExam: Boolean(section.isFinalExam),
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

  const selected = previewLessons[selectedLessonIndex] ?? null;
  const nextLesson = previewLessons[selectedLessonIndex + 1] ?? null;
  const isLastLesson = selectedLessonIndex >= previewLessons.length - 1;
  const isNewSection =
    nextLesson !== null && nextLesson.sectionId !== selected?.sectionId;
  const totalLessons = countCourseLessons(course);
  const completedCount = localProgress?.completedLessons ?? 0;
  const progressPercent =
    localProgress?.progressPercent ??
    (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  const finalExamPassed = finalExamInfo
    ? progressMaps.blocks.get(finalExamInfo.blockId)?.passed ?? false
    : true;
  const hasCertificateTemplate = true;
  const hasDc3Template = true;
  const enrolledViaCompany = localProgress?.enrolledViaCompany ?? false;
  const courseCompleted = totalLessons > 0 && completedCount >= totalLessons;
  const assignmentsApproved = allRequiredAssignmentsApproved(course, progressMaps.assignments);
  const canDownloadCertificate =
    mode === "classroom" &&
    hasCertificateTemplate &&
    finalExamPassed &&
    courseCompleted &&
    assignmentsApproved;
  const canDownloadDc3 =
    mode === "classroom" &&
    enrolledViaCompany &&
    hasDc3Template &&
    finalExamPassed &&
    courseCompleted &&
    assignmentsApproved;
  const isCurrentFinalExamLesson = Boolean(selected?.isFinalExam);
  const currentAssignmentsApproved = selected
    ? lessonRequiredAssignmentsApproved(selected.lesson, progressMaps.assignments)
    : true;
  const currentQuizzesPassed = selected
    ? lessonQuizzesPassed(selected.lesson, isCurrentFinalExamLesson, progressMaps.blocks)
    : true;
  const practiceQuizzesPassed = allPracticeQuizzesPassed(course, progressMaps.blocks);
  const canAccessFinalExam = practiceQuizzesPassed && assignmentsApproved;
  const nextIsFinalExam = Boolean(nextLesson?.isFinalExam);
  const canAdvanceFromCurrentLesson =
    currentQuizzesPassed &&
    currentAssignmentsApproved &&
    (!isCurrentFinalExamLesson || finalExamPassed) &&
    (!nextIsFinalExam || canAccessFinalExam);

  useEffect(() => {
    if (mode !== "classroom" || hasRestoredLesson.current || previewLessons.length === 0) {
      return;
    }

    const lastLessonId = localProgress?.lastLessonId;
    if (lastLessonId) {
      const index = previewLessons.findIndex((item) => item.lesson.id === lastLessonId);
      const lastPreview = index >= 0 ? previewLessons[index] : null;
      if (lastPreview && !(lastPreview.isFinalExam && !canAccessFinalExam)) {
        setSelectedLessonIndex(index);
      }
    }

    hasRestoredLesson.current = true;
  }, [canAccessFinalExam, localProgress?.lastLessonId, mode, previewLessons]);

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
      const preview = previewLessons[index];
      if (!preview) return;

      if (
        mode === "classroom" &&
        preview.isFinalExam &&
        !canAccessFinalExam
      ) {
        showError(
          "Para presentar el examen debes aprobar los quizzes con 80% y tener las tareas obligatorias aprobadas.",
        );
        return;
      }

      setSelectedLessonIndex(index);
      if (mode !== "classroom") return;

      void persistProgress({
        lastLessonId: preview.lesson.id,
        lessonUpdates: [{ lessonId: preview.lesson.id, accessed: true }],
      });
    },
    [canAccessFinalExam, mode, persistProgress, previewLessons],
  );

  const handleGoToPrevious = useCallback(() => {
    if (selectedLessonIndex > 0) {
      handleSelectLesson(selectedLessonIndex - 1);
    }
  }, [handleSelectLesson, selectedLessonIndex]);

  const handleAdvance = useCallback(() => {
    const current = previewLessons[selectedLessonIndex];
    if (!current || mode !== "classroom") return;

    const nextIndex = selectedLessonIndex + 1;
    const next = previewLessons[nextIndex];

    void persistProgress({
      lastLessonId: next?.lesson.id ?? current.lesson.id,
      lessonUpdates: [
        { lessonId: current.lesson.id, completed: true, accessed: true },
        ...(next ? [{ lessonId: next.lesson.id, accessed: true }] : []),
      ],
    }).then(() => {
      if (next) {
        setSelectedLessonIndex(nextIndex);
      }
    });
  }, [mode, persistProgress, previewLessons, selectedLessonIndex]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => progressMaps.lessons.get(lessonId)?.completed ?? false,
    [progressMaps.lessons],
  );

  const handleDownloadCertificate = useCallback(async () => {
    setIsDownloadingCertificate(true);
    try {
      await downloadCourseCertificate(course.slug);
      showSuccess("Constancia descargada");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "No se pudo descargar la constancia",
      );
    } finally {
      setIsDownloadingCertificate(false);
    }
  }, [course.slug]);

  const handleDownloadDc3 = useCallback(async () => {
    setIsDownloadingDc3(true);
    try {
      await downloadCourseDc3(course.slug);
      showSuccess("DC3 descargado");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo descargar el DC3");
    } finally {
      setIsDownloadingDc3(false);
    }
  }, [course.slug]);

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
          {(canDownloadCertificate || canDownloadDc3) && (
            <div className="mt-4 space-y-2">
              {canDownloadCertificate && (
                <button
                  type="button"
                  disabled={isDownloadingCertificate}
                  onClick={() => void handleDownloadCertificate()}
                  className="block w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  {isDownloadingCertificate ? "Generando constancia..." : "Descargar constancia"}
                </button>
              )}
              {canDownloadDc3 && (
                <button
                  type="button"
                  disabled={isDownloadingDc3}
                  onClick={() => void handleDownloadDc3()}
                  className="block w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
                >
                  {isDownloadingDc3 ? "Generando DC-3..." : "Descargar DC-3"}
                </button>
              )}
            </div>
          )}
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
                          {section.isFinalExam && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              Examen final
                            </span>
                          )}
                        </p>
                        <ul className="space-y-1">
                          {section.lessons.map((lesson) => {
                            const previewIndex = previewLessons.findIndex(
                              (item) => item.lesson.id === lesson.id,
                            );
                            const isActive = previewIndex === selectedLessonIndex;
                            const isCompleted = isLessonCompleted(lesson.id);
                            const examLocked =
                              mode === "classroom" &&
                              Boolean(section.isFinalExam) &&
                              !canAccessFinalExam;

                            return (
                              <li key={lesson.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectLesson(previewIndex)}
                                  className={cn(
                                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                    isActive
                                      ? "bg-white font-semibold text-brand-blue shadow-sm ring-1 ring-brand-line"
                                      : examLocked
                                        ? "text-brand-muted"
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
                          isFinalExam={selected.isFinalExam}
                          courseSlug={course.slug}
                          blockProgress={progressMaps.blocks.get(block.id)}
                          assignmentProgress={progressMaps.assignments.get(block.id)}
                          readOnly={mode !== "classroom"}
                          onCourseProgressChange={
                            mode === "classroom"
                              ? (next) => setLocalProgress(next)
                              : undefined
                          }
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
                        <button
                          type="button"
                          onClick={handleGoToPrevious}
                          disabled={selectedLessonIndex === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-line px-5 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ← Clase anterior
                        </button>

                        {isLastLesson ? (
                          <div className="flex flex-col items-stretch gap-2 sm:items-end">
                            {isLessonCompleted(selected.lesson.id) ? (
                              <div className="w-full max-w-sm space-y-2 sm:ml-auto">
                                <p className="text-sm font-medium text-emerald-700 sm:text-right">
                                  ¡Has completado todo el curso!
                                </p>
                                {canDownloadCertificate && (
                                  <button
                                    type="button"
                                    disabled={isDownloadingCertificate}
                                    onClick={() => void handleDownloadCertificate()}
                                    className="block w-full rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    {isDownloadingCertificate
                                      ? "Generando constancia..."
                                      : "Descargar constancia"}
                                  </button>
                                )}
                                {canDownloadDc3 && (
                                  <button
                                    type="button"
                                    disabled={isDownloadingDc3}
                                    onClick={() => void handleDownloadDc3()}
                                    className="block w-full rounded-lg border border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
                                  >
                                    {isDownloadingDc3 ? "Generando DC-3..." : "Descargar DC-3"}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleAdvance}
                                disabled={!canAdvanceFromCurrentLesson}
                                className="rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Finalizar curso
                              </button>
                            )}
                            {!canAdvanceFromCurrentLesson && isCurrentFinalExamLesson && (
                              <p className="text-xs text-amber-800">
                                Aprueba el examen final (80%) para poder finalizar el curso.
                              </p>
                            )}
                            {!canAdvanceFromCurrentLesson &&
                              !isCurrentFinalExamLesson &&
                              !currentQuizzesPassed && (
                              <p className="text-xs text-amber-800">
                                Aprueba el quiz con al menos 80% para continuar.
                              </p>
                            )}
                            {!canAdvanceFromCurrentLesson &&
                              !isCurrentFinalExamLesson &&
                              !currentAssignmentsApproved && (
                              <p className="text-xs text-amber-800">
                                La tarea obligatoria debe estar aprobada para continuar.
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAdvance}
                            disabled={!canAdvanceFromCurrentLesson}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isNewSection ? (
                              <>
                                Siguiente sección
                                <span className="font-normal text-white/80">
                                  ({nextLesson.sectionTitle})
                                </span>
                              </>
                            ) : (
                              "Siguiente clase"
                            )}
                            <span aria-hidden>→</span>
                          </button>
                        )}
                        {!isLastLesson && nextIsFinalExam && !canAccessFinalExam && (
                          <p className="text-xs text-amber-800 sm:text-right">
                            Para el examen: quizzes al 80% y tareas obligatorias aprobadas.
                          </p>
                        )}
                        {!isLastLesson && !canAdvanceFromCurrentLesson && isCurrentFinalExamLesson && (
                          <p className="text-xs text-amber-800 sm:text-right">
                            Aprueba el examen final (80%) para continuar.
                          </p>
                        )}
                        {!isLastLesson &&
                          !canAdvanceFromCurrentLesson &&
                          !isCurrentFinalExamLesson &&
                          !currentQuizzesPassed && (
                          <p className="text-xs text-amber-800 sm:text-right">
                            Aprueba el quiz con al menos 80% para continuar.
                          </p>
                        )}
                        {!isLastLesson &&
                          !canAdvanceFromCurrentLesson &&
                          !isCurrentFinalExamLesson &&
                          !currentAssignmentsApproved && (
                          <p className="text-xs text-amber-800 sm:text-right">
                            La tarea obligatoria debe estar aprobada para continuar.
                          </p>
                        )}
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
