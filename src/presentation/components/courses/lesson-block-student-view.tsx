import Image from "next/image";
import type { LessonBlock } from "@/core/domain/courses/types";
import { BLOCK_TYPE_LABELS } from "@/core/domain/courses/types";
import type { AssignmentProgressItem } from "@/core/domain/courses/assignment";
import type { BlockProgressItem } from "@/core/domain/student/progress.types";
import type { CourseProgress } from "@/core/domain/student/progress.types";
import { QuizBlockStudentView } from "@/presentation/components/courses/quiz-block-student-view";
import { AssignmentBlockStudentView } from "@/presentation/components/courses/assignment-block-student-view";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

interface LessonBlockStudentViewProps {
  block: LessonBlock;
  index: number;
  isFinalExam?: boolean;
  courseSlug?: string;
  blockProgress?: BlockProgressItem;
  assignmentProgress?: AssignmentProgressItem;
  readOnly?: boolean;
  onBlockProgressChange?: (update: {
    blockId: string;
    answers?: Record<string, number>;
    verified?: boolean;
    passed?: boolean;
    score?: number;
    totalQuestions?: number;
  }) => void;
  onCourseProgressChange?: (progress: CourseProgress) => void;
}

export function LessonBlockStudentView({
  block,
  index,
  isFinalExam = false,
  courseSlug = "",
  blockProgress,
  assignmentProgress,
  readOnly = false,
  onBlockProgressChange,
  onCourseProgressChange,
}: LessonBlockStudentViewProps) {
  const label = BLOCK_TYPE_LABELS[block.type];
  const hasTitle = Boolean(block.title?.trim());
  const hasContent = Boolean(block.content?.trim());
  const hasResource = Boolean(block.resourceUrl?.trim());
  const hasQuiz = block.type === "quiz" && (hasContent || hasTitle);
  const hasAssignment = block.type === "assignment";

  if (!hasTitle && !hasContent && !hasResource && !hasQuiz && !hasAssignment) {
    return (
      <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-6 text-center text-sm text-brand-muted">
        Bloque {index + 1} ({label}) sin contenido
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-brand-line bg-white">
      <header className="flex items-center gap-2 border-b border-brand-line bg-brand-light/60 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{label}</span>
        {hasTitle && (
          <span className="truncate text-sm font-medium text-brand-gray">{block.title}</span>
        )}
      </header>

      <div className="p-4 sm:p-5">
        {block.type === "video" && hasResource && (
          <VideoBlock url={block.resourceUrl!} />
        )}

        {block.type === "image" && hasResource && (
          <ImageBlock url={block.resourceUrl!} alt={block.title ?? "Imagen de la clase"} />
        )}

        {block.type === "presentation" && hasResource && (
          <PdfBlock url={block.resourceUrl!} />
        )}

        {block.type === "file" && hasResource && (
          <PdfBlock url={block.resourceUrl!} downloadLabel="Descargar archivo PDF" />
        )}

        {block.type === "text" && hasContent && (
          <div className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">
            {block.content}
          </div>
        )}

        {block.type === "quiz" && (
          <QuizBlockStudentView
            content={block.content}
            variant={isFinalExam ? "final" : "practice"}
            blockId={block.id}
            blockProgress={blockProgress}
            onProgressChange={onBlockProgressChange}
          />
        )}

        {block.type === "assignment" && (
          <AssignmentBlockStudentView
            block={block}
            courseSlug={courseSlug}
            assignment={assignmentProgress}
            readOnly={readOnly}
            onProgressChange={onCourseProgressChange}
          />
        )}

        {block.type === "text" && !hasContent && hasResource && (
          <ResourceLink url={block.resourceUrl!} />
        )}
      </div>
    </article>
  );
}

function ImageBlock({ url, alt }: { url: string; alt: string }) {
  const src = resolveAssetUrl(url);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-brand-line bg-brand-light">
      <Image src={src} alt={alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 60vw" />
    </div>
  );
}

function VideoBlock({ url }: { url: string }) {
  const embedUrl = getVideoEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title="Video de la clase"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <ResourceLink url={url} label="Abrir video en YouTube" />;
}

function PdfBlock({ url, downloadLabel = "Descargar PDF" }: { url: string; downloadLabel?: string }) {
  const src = resolveAssetUrl(url);

  return (
    <div className="space-y-3">
      <iframe
        src={src}
        title="Documento PDF"
        className="h-[min(70vh,640px)] w-full rounded-lg border border-brand-line bg-white"
      />
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90"
      >
        <DownloadIcon />
        {downloadLabel}
      </a>
    </div>
  );
}

function ResourceLink({ url, label = "Abrir recurso" }: { url: string; label?: string }) {
  const href = resolveAssetUrl(url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
    >
      <ExternalLinkIcon />
      {label}
    </a>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
