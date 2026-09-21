"use client";

import { useCallback, useEffect, useState } from "react";
import type { EventFormValues, EventListItem } from "@/core/domain/events/types";
import { EMPTY_EVENT_FORM } from "@/core/domain/events/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  EventsApiError,
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from "@/infrastructure/http/events-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { EventForm } from "@/presentation/components/admin/events/event-form";
import { EventsTable } from "@/presentation/components/admin/events/events-table";

const PAGE_SIZE = 20;

export function EventsPageContent() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EventFormValues>(EMPTY_EVENT_FORM);

  const loadEvents = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await listEvents(token, {
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setEvents(result.events);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(err instanceof EventsApiError ? err.message : "Error al cargar eventos");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function openCreate() {
    setEditingId(null);
    setFormValues({
      ...EMPTY_EVENT_FORM,
      sortOrder: total,
    });
    setMode("create");
  }

  function openEdit(event: EventListItem) {
    setEditingId(event.id);
    setFormValues({
      title: event.title,
      eventType: event.eventType,
      modality: event.modality,
      dateLabel: event.dateLabel,
      description: event.description,
      status: event.status,
      isVisible: event.isVisible,
      sortOrder: event.sortOrder,
    });
    setMode("edit");
  }

  async function handleSave() {
    const token = authStorage.getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      if (mode === "edit" && editingId) {
        await updateEvent(token, editingId, formValues);
        showSuccess("Evento actualizado.");
      } else {
        await createEvent(token, formValues);
        showSuccess("Evento creado.");
      }
      setMode("list");
      setEditingId(null);
      await loadEvents();
    } catch (err) {
      showError(err instanceof EventsApiError ? err.message : "No se pudo guardar el evento");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(event: EventListItem) {
    const token = authStorage.getToken();
    if (!token) return;
    if (!window.confirm(`¿Eliminar el evento «${event.title}»?`)) return;

    try {
      await deleteEvent(token, event.id);
      showSuccess("Evento eliminado.");
      await loadEvents();
    } catch (err) {
      showError(err instanceof EventsApiError ? err.message : "No se pudo eliminar");
    }
  }

  if (mode === "create" || mode === "edit") {
    return (
      <>
        <AdminPageHeader
          title={mode === "create" ? "Nuevo evento" : "Editar evento"}
          description="Completa los campos. El preview muestra exactamente cómo se verá la tarjeta en /eventos."
        />
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <EventForm
            values={formValues}
            isSaving={isSaving}
            submitLabel={mode === "create" ? "Crear evento" : "Guardar cambios"}
            onChange={(patch) => setFormValues((current) => ({ ...current, ...patch }))}
            onSubmit={handleSave}
            onCancel={() => {
              setMode("list");
              setEditingId(null);
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Eventos"
        description="Administra las tarjetas de /eventos. Solo los publicados y visibles aparecen en el sitio."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
          >
            Nuevo evento
          </button>
        }
      />

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, tipo o descripción..."
          className="w-full max-w-md rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <p className="mb-3 text-sm text-brand-muted">
        {total} evento{total === 1 ? "" : "s"}
      </p>

      <EventsTable
        events={events}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(event) => void handleDelete(event)}
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
}
