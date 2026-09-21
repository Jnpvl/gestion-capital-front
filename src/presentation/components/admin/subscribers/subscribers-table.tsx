"use client";

import type { SubscriberListItem, SubscriberStatus } from "@/core/domain/subscribers/types";

interface SubscribersTableProps {
  subscribers: SubscriberListItem[];
  isLoading: boolean;
  onToggleStatus: (subscriber: SubscriberListItem) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: SubscriberStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-brand-light text-brand-muted"
      }`}
    >
      {isActive ? "Activo" : "Dado de baja"}
    </span>
  );
}

export function SubscribersTable({
  subscribers,
  isLoading,
  onToggleStatus,
}: SubscribersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">
        Cargando suscriptores...
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-8 text-sm text-brand-muted">
        No hay suscriptores con esos filtros.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-line bg-brand-light/50 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-brand-line last:border-0">
                <td className="px-4 py-3 font-medium text-brand-gray">{subscriber.name}</td>
                <td className="px-4 py-3 text-brand-muted">
                  <a href={`mailto:${subscriber.email}`} className="hover:text-brand-blue">
                    {subscriber.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-brand-muted">{subscriber.company || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={subscriber.status} />
                </td>
                <td className="px-4 py-3 text-brand-muted">{formatDate(subscriber.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(subscriber)}
                    className="rounded-lg border border-brand-line px-3 py-1.5 text-xs font-medium text-brand-gray hover:bg-brand-light"
                  >
                    {subscriber.status === "active" ? "Dar de baja" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
