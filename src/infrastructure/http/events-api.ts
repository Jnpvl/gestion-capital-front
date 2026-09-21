import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  EventFormValues,
  EventListItem,
  EventStatus,
  EventsListResponse,
} from "@/core/domain/events/types";
import { env } from "@/shared/config/env";

class EventsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "EventsApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/events${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new EventsApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listEvents(
  token: string,
  params?: {
    search?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
  },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return request<EventsListResponse>(qs ? `?${qs}` : "", token);
}

export async function getEvent(token: string, id: string) {
  return request<{ event: EventListItem }>(`/${id}`, token);
}

export async function createEvent(token: string, input: EventFormValues) {
  return request<{ event: EventListItem }>("", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(token: string, id: string, input: Partial<EventFormValues>) {
  return request<{ event: EventListItem }>(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(token: string, id: string) {
  return request<{ ok: boolean }>(`/${id}`, token, {
    method: "DELETE",
  });
}

export { EventsApiError };
