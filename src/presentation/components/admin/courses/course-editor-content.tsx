"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CourseDetail, CourseSection } from "@/core/domain/courses/types";
import { countCourseLessons } from "@/core/domain/courses/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CoursesApiError,
  getCourse,
  updateCourseContent,
  updateCoursePromotion,
} from "@/infrastructure/http/courses-api";
import { showError, showSaved } from "@/shared/lib/alerts";
import { CourseContentEditor } from "@/presentation/components/admin/courses/course-content-editor";
import { CoursePromotionForm } from "@/presentation/components/admin/courses/course-promotion-form";
import { CourseTemplatesForm } from "@/presentation/components/admin/courses/course-templates-form";
import { CourseStudentsTab } from "@/presentation/components/admin/courses/course-students-tab";
import { CourseAssignmentsTab } from "@/presentation/components/admin/courses/course-assignments-tab";
import { CoursePresencialEmissionTab } from "@/presentation/components/admin/courses/course-presencial-emission-tab";
import { CourseStudentPreview } from "@/presentation/components/courses/course-student-preview";
import { CourseStatusBadge } from "@/presentation/components/courses/course-status-badge";

type Tab =
  | "promotion"
  | "templates"
  | "content"
  | "assignments"
  | "students"
  | "presencial"
  | "preview";

export function CourseEditorContent() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tab, setTab] = useState<Tab>("promotion");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadCourse = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const { course: data } = await getCourse(token, courseId);
      setCourse(data);
    } catch (err) {
      const message =
        err instanceof CoursesApiError ? err.message : "No se pudo cargar el curso";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  async function handleSaveTemplates(data: Record<string, unknown>) {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsSaving(true);

    try {
      const { course: updated } = await updateCoursePromotion(token, courseId, data);
      setCourse(updated);
      showSaved("Plantillas guardadas correctamente.");
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudieron guardar las plantillas",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePromotion(data: Record<string, unknown>) {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsSaving(true);

    try {
      const { course: updated } = await updateCoursePromotion(token, courseId, data);
      setCourse(updated);
      showSaved("Promoción guardada correctamente.");
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo guardar la promoción",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveContent(sections: CourseSection[]) {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsSaving(true);

    try {
      const { course: updated } = await updateCourseContent(token, courseId, sections);
      setCourse(updated);
      showSaved("Contenido guardado correctamente.");
    } catch (err) {
      showError(
        err instanceof CoursesApiError ? err.message : "No se pudo guardar el contenido",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="text-sm text-brand-muted">Cargando curso...</div>;
  }

  if (!course) {
    return (
      <div className="rounded-xl border border-brand-line bg-brand-light p-6 text-sm text-brand-muted">
        {loadError || "Curso no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/cursos"
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            ← Volver a cursos
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-brand-gray">{course.title}</h1>
            <CourseStatusBadge status={course.status} />
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            {countCourseLessons(course)} clase{countCourseLessons(course) === 1 ? "" : "s"} ·{" "}
            {course.sections.length} sección{course.sections.length === 1 ? "" : "es"} · /cursos/
            {course.slug}
          </p>
        </div>

        {course.status === "published" && course.showInCatalog && (
          <Link
            href={`/cursos/${course.slug}`}
            target="_blank"
            className="inline-flex rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-blue hover:bg-brand-light"
          >
            Ver página pública
          </Link>
        )}
      </div>

      <div className="flex gap-2 border-b border-brand-line">
        <button
          type="button"
          onClick={() => setTab("promotion")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "promotion"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Promoción
        </button>
        <button
          type="button"
          onClick={() => setTab("templates")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "templates"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Plantillas
        </button>
        <button
          type="button"
          onClick={() => setTab("content")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "content"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Contenido
        </button>
        <button
          type="button"
          onClick={() => setTab("assignments")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "assignments"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Tareas
        </button>
        <button
          type="button"
          onClick={() => setTab("students")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "students"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Alumnos
        </button>
        <button
          type="button"
          onClick={() => setTab("presencial")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "presencial"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Emisión presencial
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "preview"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-brand-muted hover:text-brand-gray"
          }`}
        >
          Vista alumno
        </button>
      </div>

      <div className={tab === "preview" ? "" : "rounded-2xl border border-brand-line bg-white p-6"}>
        {tab === "promotion" ? (
          <CoursePromotionForm
            key={course.updatedAt}
            course={course}
            isSaving={isSaving}
            onSave={handleSavePromotion}
          />
        ) : tab === "templates" ? (
          <CourseTemplatesForm
            key={`${course.updatedAt}-templates`}
            course={course}
            isSaving={isSaving}
            onSave={handleSaveTemplates}
          />
        ) : tab === "content" ? (
          <CourseContentEditor
            key={`${course.updatedAt}-content`}
            courseId={course.id}
            sections={course.sections}
            isSaving={isSaving}
            onSave={handleSaveContent}
          />
        ) : tab === "assignments" ? (
          <CourseAssignmentsTab courseId={course.id} />
        ) : tab === "students" ? (
          <CourseStudentsTab courseId={course.id} />
        ) : tab === "presencial" ? (
          <CoursePresencialEmissionTab
            courseId={course.id}
            coursePublished={course.status === "published"}
          />
        ) : (
          <CourseStudentPreview key={`${course.updatedAt}-preview`} course={course} />
        )}
      </div>
    </div>
  );
}
