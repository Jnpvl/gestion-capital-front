"use client";

import { useCallback, useEffect, useState } from "react";
import type { SubscriberListItem, SubscriberStatus } from "@/core/domain/subscribers/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  SubscribersApiError,
  listSubscribers,
  updateSubscriberStatus,
} from "@/infrastructure/http/subscribers-api";
import { showError, showSuccess } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { SubscribersTable } from "@/presentation/components/admin/subscribers/subscribers-table";

const PAGE_SIZE = 20;
const COPY_PAGE_SIZE = 100;

export function SubscribersPageContent() {
  const [subscribers, setSubscribers] = useState<SubscriberListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | "">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  const loadSubscribers = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await listSubscribers(token, {
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setSubscribers(result.subscribers);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      showError(
        err instanceof SubscribersApiError ? err.message : "Error al cargar suscriptores",
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  async function handleToggleStatus(subscriber: SubscriberListItem) {
    const token = authStorage.getToken();
    if (!token) return;

    const nextStatus: SubscriberStatus =
      subscriber.status === "active" ? "unsubscribed" : "active";

    try {
      await updateSubscriberStatus(token, subscriber.id, nextStatus);
      showSuccess(
        nextStatus === "active"
          ? "Suscriptor reactivado."
          : "Suscriptor dado de baja.",
      );
      await loadSubscribers();
    } catch (err) {
      showError(
        err instanceof SubscribersApiError ? err.message : "No se pudo actualizar el estado",
      );
    }
  }

  async function handleCopyEmails() {
    const token = authStorage.getToken();
    if (!token) return;

    setIsCopying(true);
    try {
      const emails: string[] = [];
      let currentPage = 1;
      let pages = 1;

      do {
        const result = await listSubscribers(token, {
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          limit: COPY_PAGE_SIZE,
        });
        for (const item of result.subscribers) {
          const email = item.email.trim().toLowerCase();
          if (email && !emails.includes(email)) emails.push(email);
        }
        pages = result.totalPages;
        currentPage += 1;
      } while (currentPage <= pages);

      if (emails.length === 0) {
        showError("No hay correos para copiar con el filtro actual.");
        return;
      }

      await navigator.clipboard.writeText(emails.join(", "));
      showSuccess(
        `${emails.length} correo${emails.length === 1 ? "" : "s"} listo${emails.length === 1 ? "" : "s"} para pegar en BCC.`,
        "Correos copiados",
      );
    } catch (err) {
      showError(
        err instanceof SubscribersApiError
          ? err.message
          : "No se pudieron copiar los correos.",
      );
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Suscritos"
        description="Personas que se registraron desde el formulario de Suscríbete para recibir novedades."
        action={
          <button
            type="button"
            onClick={() => void handleCopyEmails()}
            disabled={isCopying || total === 0}
            className="rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-gray hover:bg-brand-light disabled:opacity-50"
          >
            {isCopying ? "Copiando..." : "Copiar emails"}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo o empresa..."
          className="w-full max-w-md rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as SubscriberStatus | "");
            setPage(1);
          }}
          className="rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="unsubscribed">Dados de baja</option>
        </select>
      </div>

      <p className="mb-3 text-sm text-brand-muted">
        {total} suscriptor{total === 1 ? "" : "es"} · Copiar emails usa el filtro actual
      </p>

      <SubscribersTable
        subscribers={subscribers}
        isLoading={isLoading}
        onToggleStatus={(subscriber) => void handleToggleStatus(subscriber)}
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
