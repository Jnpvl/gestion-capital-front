import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  SubscriberListItem,
  SubscriberStatus,
  SubscribersListResponse,
} from "@/core/domain/subscribers/types";
import { env } from "@/shared/config/env";

class SubscribersApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SubscribersApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/subscribers${path}`, {
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
    throw new SubscribersApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listSubscribers(
  token: string,
  params?: {
    search?: string;
    status?: SubscriberStatus;
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

  return request<SubscribersListResponse>(qs ? `?${qs}` : "", token);
}

export async function updateSubscriberStatus(
  token: string,
  id: string,
  status: SubscriberStatus,
) {
  return request<{ subscriber: SubscriberListItem }>(`/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export { SubscribersApiError };
