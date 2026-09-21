"use client";

import type { EventListItem } from "@/core/domain/events/types";

interface EventsTableProps {
  events: EventListItem[];
  isLoading: boolean;
  onEdit: (event: EventListItem) => void;
  onDelete: (event: EventListItem) => void;
}

export function EventsTable({ events, isLoading, onEdit, onDelete }: EventsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">
        Cargando eventos...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">
        No hay eventos. Crea el primero para mostrarlo en /eventos.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-line bg-brand-light/50 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Orden</th>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Visible</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-brand-line last:border-0">
                <td className="px-4 py-3 text-brand-muted">{event.sortOrder}</td>
                <td className="px-4 py-3 font-medium text-brand-gray">{event.title}</td>
                <td className="px-4 py-3 text-brand-muted">{event.eventType}</td>
                <td className="px-4 py-3 text-brand-muted">{event.dateLabel}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      event.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-brand-light text-brand-muted"
                    }`}
                  >
                    {event.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {event.isVisible ? "Sí" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(event)}
                      className="rounded-lg border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-gray hover:bg-brand-light"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(event)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
