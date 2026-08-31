import Image from "next/image";
import Link from "next/link";
import type { CoursePublicCard } from "@/core/domain/courses/types";
import { DEFAULT_COVER_IMAGE, MODALITY_LABELS } from "@/core/domain/courses/types";
import type { CourseModality } from "@/core/domain/courses/types";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

interface CourseCardProps {
  course: CoursePublicCard;
}

export function CourseCard({ course }: CourseCardProps) {
  const modality =
    course.modality && course.modality in MODALITY_LABELS
      ? MODALITY_LABELS[course.modality as CourseModality]
      : course.modality;

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-colors hover:border-brand-blue/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-light">
        <Image
          src={resolveAssetUrl(course.coverImage) || DEFAULT_COVER_IMAGE}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {modality && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
            {modality}
          </span>
        )}
        <h3 className="mt-2 font-display text-lg font-bold text-brand-gray group-hover:text-brand-blue">
          {course.title}
        </h3>
        {course.shortDescription && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-muted">
            {course.shortDescription}
          </p>
        )}
        <span className="mt-4 text-sm font-semibold text-brand-black group-hover:text-brand-gray">Ver curso →</span>
      </div>
    </Link>
  );
}
