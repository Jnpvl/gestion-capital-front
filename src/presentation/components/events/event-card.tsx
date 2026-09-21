import Link from "next/link";
import type { EventPublicItem } from "@/core/domain/events/types";
import { cn } from "@/shared/lib/cn";

interface EventCardProps {
  event: Pick<
    EventPublicItem,
    "title" | "eventType" | "modality" | "dateLabel" | "description"
  >;
  className?: string;
  /** In admin preview, render a non-navigating button */
  preview?: boolean;
}

export function EventCard({ event, className, preview = false }: EventCardProps) {
  const contactHref = `/contacto?servicio=${encodeURIComponent(
    event.title.trim() || "Evento",
  )}`;

  const ctaClassName =
    "mt-6 inline-flex w-full items-center justify-center rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-gray";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-brand-line bg-white p-8",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
          {event.eventType || "Tipo"}
        </span>
        <span className="text-xs text-brand-muted">{event.modality || "Modalidad"}</span>
      </div>
      <h2 className="mt-4 font-display text-lg font-bold text-brand-gray">
        {event.title || "Título del evento"}
      </h2>
      <p className="mt-1 text-sm font-medium text-brand-gold">
        {event.dateLabel || "Fecha"}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">
        {event.description || "Descripción del evento"}
      </p>
      {preview ? (
        <span className={ctaClassName}>Solicitar información</span>
      ) : (
        <Link href={contactHref} className={ctaClassName}>
          Solicitar información
        </Link>
      )}
    </article>
  );
}
