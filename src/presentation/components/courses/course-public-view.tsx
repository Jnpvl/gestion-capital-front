import Image from "next/image";
import Link from "next/link";
import {
  DEFAULT_COVER_IMAGE,
  MODALITY_LABELS,
  hasObjectives,
  hasParticipantProfile,
  normalizeObjectives,
  normalizeParticipantProfile,
  normalizeSyllabus,
  type CourseModality,
  type CoursePublicDetail,
} from "@/core/domain/courses/types";
import { Container } from "@/presentation/components/ui/container";
import { siteConfig } from "@/shared/content/site";
import { cn } from "@/shared/lib/cn";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";

export interface CoursePublicViewProps {
  course: CoursePublicDetail;
  /** Compact frame for admin live preview */
  preview?: boolean;
  className?: string;
}

export function CoursePublicView({ course, preview = false, className }: CoursePublicViewProps) {
  const modality =
    course.modality && course.modality in MODALITY_LABELS
      ? MODALITY_LABELS[course.modality as CourseModality]
      : course.modality;

  const participantProfile = normalizeParticipantProfile(course.participantProfile);
  const objectives = normalizeObjectives(course.objectives);
  const syllabus = normalizeSyllabus(course.syllabus);

  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(
    `Hola, me interesa el curso "${course.title}". ¿Podrían darme más información?`,
  )}`;

  const profileRows = [
    { label: "Psicográficas", value: participantProfile.psychographics },
    { label: "Conocimientos", value: participantProfile.knowledge },
    { label: "Habilidades", value: participantProfile.skills },
  ].filter((row) => row.value);

  return (
    <div className={cn(preview && "overflow-hidden rounded-2xl border border-brand-line bg-white", className)}>
      <section className="relative overflow-hidden border-b border-brand-line bg-brand-gray text-white">
        <div className="absolute inset-0">
          <Image
            src={resolveAssetUrl(course.coverImage) || DEFAULT_COVER_IMAGE}
            alt=""
            fill
            className="object-cover opacity-30"
            priority={!preview}
          />
        </div>
        <Container className={cn("relative", preview ? "py-10 sm:py-12" : "py-16 sm:py-24")}>
          {modality && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {modality}
            </span>
          )}
          <h1
            className={cn(
              "mt-3 max-w-3xl font-display font-bold tracking-tight",
              preview ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl",
            )}
          >
            {course.title || "Título del curso"}
          </h1>
          {course.shortDescription && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
              {course.shortDescription}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            {course.duration && <span>Duración: {course.duration}</span>}
            {course.level && <span>Nivel: {course.level}</span>}
          </div>
        </Container>
      </section>

      <section className={preview ? "py-8 sm:py-10" : "py-16 sm:py-20"}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {course.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">Sobre el curso</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-brand-muted">
                    {course.description}
                  </p>
                </div>
              )}

              {hasParticipantProfile(participantProfile) && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">
                    ¿A quién va dirigido?
                  </h2>
                  <dl className="mt-4 space-y-4">
                    {profileRows.map((row) => (
                      <div key={row.label}>
                        <dt className="text-sm font-semibold text-brand-gray">{row.label}</dt>
                        <dd className="mt-1 whitespace-pre-line text-base leading-relaxed text-brand-muted">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {hasObjectives(objectives) && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">Objetivos</h2>
                  {objectives.general && (
                    <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-brand-muted">
                      {objectives.general}
                    </p>
                  )}
                  {objectives.items.length > 0 && (
                    <ul className="mt-4 space-y-3">
                      {objectives.items.map((item, index) => (
                        <li key={`${item.label}-${index}`} className="flex gap-3 text-brand-muted">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-black" />
                          <span>
                            {item.label ? (
                              <strong className="font-semibold text-brand-gray">{item.label}: </strong>
                            ) : null}
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {syllabus.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">Temario</h2>
                  <div className="mt-4 space-y-4">
                    {syllabus.map((unit, index) => (
                      <div
                        key={`${unit.title}-${index}`}
                        className="rounded-xl border border-brand-line bg-brand-light/40 p-4"
                      >
                        <h3 className="font-semibold text-brand-gray">
                          Unidad {index + 1}: {unit.title}
                        </h3>
                        {unit.topics.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {unit.topics.map((topic) => (
                              <li key={topic} className="flex gap-3 text-sm text-brand-muted">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.highlights.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-gray">
                    Lo que aprenderás
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {course.highlights.map((item) => (
                      <li key={item} className="flex gap-3 text-brand-muted">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-black" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-light p-6">
              <h2 className="font-display text-xl font-bold text-brand-gray">¿Te interesa?</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                Escríbenos y te ayudamos con fechas, modalidad e inscripción para tu equipo.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {preview ? (
                  <>
                    <span className="inline-flex justify-center rounded-lg bg-brand-black px-4 py-3 text-sm font-semibold text-white">
                      Solicitar información
                    </span>
                    <span className="inline-flex justify-center rounded-lg border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-gray">
                      WhatsApp
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      href="/contacto"
                      className="inline-flex justify-center rounded-lg bg-brand-black px-4 py-3 text-sm font-semibold text-white hover:bg-brand-gray"
                    >
                      Solicitar información
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center rounded-lg border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-gray hover:bg-white/80"
                    >
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
