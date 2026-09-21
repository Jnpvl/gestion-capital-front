"use client";

import type { EventFormValues } from "@/core/domain/events/types";
import { EventCard } from "@/presentation/components/events/event-card";

interface EventFormProps {
  values: EventFormValues;
  isSaving: boolean;
  submitLabel: string;
  onChange: (patch: Partial<EventFormValues>) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
}

const EVENT_TYPE_OPTIONS = ["Capacitación", "Taller", "Conferencia", "Webinar", "Otro"];
const MODALITY_OPTIONS = [
  "Presencial",
  "En línea",
  "Híbrido",
  "Presencial / Híbrido",
  "Presencial / En línea",
];

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-brand-muted">{children}</p>;
}

export function EventForm({
  values,
  isSaving,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: EventFormProps) {
  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        className="space-y-6"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">
            Título del evento
          </label>
          <input
            value={values.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
            placeholder="Ej. Factores de Riesgo Psicosocial — NOM-035"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <FieldHint>En el sitio: encabezado grande de la tarjeta.</FieldHint>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">
              Tipo de evento
            </label>
            <select
              value={values.eventType}
              onChange={(e) => onChange({ eventType: e.target.value })}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            >
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldHint>En el sitio: badge azul arriba a la izquierda.</FieldHint>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Modalidad</label>
            <select
              value={values.modality}
              onChange={(e) => onChange({ modality: e.target.value })}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            >
              {MODALITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldHint>En el sitio: texto gris junto al badge azul.</FieldHint>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">
            Fecha (como se muestra)
          </label>
          <input
            value={values.dateLabel}
            onChange={(e) => onChange({ dateLabel: e.target.value })}
            required
            placeholder="Ej. Próximamente · 12 de marzo de 2026"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <FieldHint>En el sitio: línea dorada debajo del título.</FieldHint>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-gray">Descripción</label>
          <textarea
            rows={5}
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            required
            placeholder="Resumen corto del evento..."
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <FieldHint>En el sitio: párrafo principal del cuerpo de la tarjeta.</FieldHint>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Estado</label>
            <select
              value={values.status}
              onChange={(e) =>
                onChange({ status: e.target.value as EventFormValues["status"] })
              }
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
            <FieldHint>Solo publicados pueden verse en /eventos.</FieldHint>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-gray">Orden</label>
            <input
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(e) => onChange({ sortOrder: Number(e.target.value) || 0 })}
              className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
            <FieldHint>Menor número = aparece primero.</FieldHint>
          </div>

          <div className="flex items-end pb-6">
            <label className="flex items-center gap-2 text-sm text-brand-gray">
              <input
                type="checkbox"
                checked={values.isVisible}
                onChange={(e) => onChange({ isVisible: e.target.checked })}
                className="rounded border-brand-line"
              />
              Visible en el sitio
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-brand-line pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-light"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : submitLabel}
          </button>
        </div>
      </form>

      <section className="space-y-3 border-t border-brand-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-gray">Vista previa en el sitio</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Así se verá la tarjeta en /eventos (misma composición actual).
            </p>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-muted">
            Preview en vivo
          </span>
        </div>
        <div className="rounded-2xl border border-brand-line bg-brand-light/40 p-4 sm:p-6">
          <div className="mx-auto max-w-md">
            <EventCard
              event={{
                title: values.title,
                eventType: values.eventType,
                modality: values.modality,
                dateLabel: values.dateLabel,
                description: values.description,
              }}
              preview
            />
          </div>
        </div>
      </section>
    </div>
  );
}
