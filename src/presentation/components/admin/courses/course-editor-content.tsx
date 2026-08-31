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
import { CourseContentEditor } from "@/presentation/components/admin/courses/course-content-editor";
import { CoursePromotionForm } from "@/presentation/components/admin/courses/course-promotion-form";
import { CourseStudentPreview } from "@/presentation/components/courses/course-student-preview";
import { CourseStatusBadge } from "@/presentation/components/courses/course-status-badge";

type Tab = "promotion" | "content" | "preview";

export function CourseEditorContent() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tab, setTab] = useState<Tab>("promotion");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCourse = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsLoading(true);
    setError("");

    try {
      const { course: data } = await getCourse(token, courseId);
      setCourse(data);
    } catch (err) {
      setError(err instanceof CoursesApiError ? err.message : "No se pudo cargar el curso");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  async function handleSavePromotion(data: Record<string, unknown>) {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { course: updated } = await updateCoursePromotion(token, courseId, data);
      setCourse(updated);
      setSuccess("Promoción guardada correctamente.");
    } catch (err) {
      setError(err instanceof CoursesApiError ? err.message : "No se pudo guardar la promoción");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveContent(sections: CourseSection[]) {
    const token = authStorage.getToken();
    if (!token || !courseId) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { course: updated } = await updateCourseContent(token, courseId, sections);
      setCourse(updated);
      setSuccess("Contenido guardado correctamente.");
    } catch (err) {
      setError(err instanceof CoursesApiError ? err.message : "No se pudo guardar el contenido");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="text-sm text-brand-muted">Cargando curso...</div>;
  }

  if (!course) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Curso no encontrado."}
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

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
        ) : tab === "content" ? (
          <CourseContentEditor
            key={`${course.updatedAt}-content`}
            courseId={course.id}
            sections={course.sections}
            isSaving={isSaving}
            onSave={handleSaveContent}
          />
        ) : (
          <CourseStudentPreview key={`${course.updatedAt}-preview`} course={course} />
        )}
      </div>
    </div>
  );
}
