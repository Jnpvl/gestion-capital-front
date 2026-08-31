"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudentCourseListItem } from "@/core/domain/student/types";
import { DEFAULT_COVER_IMAGE } from "@/core/domain/courses/types";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import { listStudentCourses } from "@/infrastructure/http/student-courses-api";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

export function StudentCoursesContent() {
  const [courses, setCourses] = useState<StudentCourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      const token = studentAuthStorage.getToken();
      if (!token) return;

      try {
        const { courses: enrolledCourses } = await listStudentCourses(token);
        setCourses(enrolledCourses);
      } catch {
        setError("No se pudieron cargar tus cursos. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCourses();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando tus cursos...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">Mis cursos</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Accede al contenido de los cursos que tienes asignados.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-brand-gray">Aún no tienes cursos asignados</p>
          <p className="mt-2 text-sm text-brand-muted">
            Cuando el equipo te asigne un curso, aparecerá aquí.
          </p>
          <Link
            href="/contacto?servicio=capacitacion"
            className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
          >
            Solicitar información
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.enrollmentId}
              href={`/mis-cursos/cursos/${course.slug}`}
              className="group overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-brand-light">
                <Image
                  src={resolveAssetUrl(course.coverImage) || DEFAULT_COVER_IMAGE}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-bold text-brand-gray group-hover:text-brand-blue">
                  {course.title}
                </h2>
                {course.shortDescription && (
                  <p className="mt-2 line-clamp-2 text-sm text-brand-muted">
                    {course.shortDescription}
                  </p>
                )}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-brand-muted">
                      <span>Progreso</span>
                      <span>{course.progressPercent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-light">
                      <div
                        className="h-full rounded-full bg-brand-blue"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brand-muted">
                    {course.completedLessons} de {course.lessonsCount}{" "}
                    {course.lessonsCount === 1 ? "clase completada" : "clases completadas"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
