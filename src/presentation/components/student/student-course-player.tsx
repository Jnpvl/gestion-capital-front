"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CourseDetail } from "@/core/domain/courses/types";
import type { CourseProgress, SaveCourseProgressInput } from "@/core/domain/student/progress.types";
import { CourseStudentPreview } from "@/presentation/components/courses/course-student-preview";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import { getStudentCourse } from "@/infrastructure/http/student-courses-api";
import {
  getCourseProgress,
  saveCourseProgress,
} from "@/infrastructure/http/student-progress-api";

interface StudentCoursePlayerProps {
  slug: string;
}

export function StudentCoursePlayer({ slug }: StudentCoursePlayerProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const token = studentAuthStorage.getToken();
      if (!token) return;

      try {
        const [courseResult, progressResult] = await Promise.all([
          getStudentCourse(token, slug),
          getCourseProgress(token, slug),
        ]);
        setCourse(courseResult.course);
        setProgress(progressResult.progress);
      } catch {
        setError("No se pudo cargar el curso o no tienes acceso.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCourse();
  }, [slug]);

  const handleSaveProgress = useCallback(
    async (input: SaveCourseProgressInput) => {
      const token = studentAuthStorage.getToken();
      if (!token) return;

      const { progress: updated } = await saveCourseProgress(token, slug, input);
      setProgress(updated);
      return updated;
    },
    [slug],
  );

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando curso...</p>;
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Curso no disponible."}
        </div>
        <Link href="/mis-cursos" className="text-sm font-semibold text-brand-blue hover:underline">
          Volver a mis cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/mis-cursos" className="text-sm font-medium text-brand-blue hover:underline">
        ← Volver a mis cursos
      </Link>
      <CourseStudentPreview
        course={course}
        mode="classroom"
        progress={progress}
        onSaveProgress={handleSaveProgress}
      />
    </div>
  );
}
