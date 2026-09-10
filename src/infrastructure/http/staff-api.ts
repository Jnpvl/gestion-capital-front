import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  CreateStaffInput,
  StaffDetail,
  StaffListResponse,
  UpdateStaffInput,
} from "@/core/domain/staff/types";
import type { StaffUser } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

class StaffApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StaffApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/staff${path}`, {
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
    throw new StaffApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listStaff(
  token: string,
  params?: {
    search?: string;
    active?: boolean;
    role?: "admin" | "teacher";
    page?: number;
    limit?: number;
  },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.active !== undefined) query.set("active", String(params.active));
  if (params?.role) query.set("role", params.role);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return request<StaffListResponse>(qs ? `?${qs}` : "", token);
}

export async function getStaff(token: string, id: string) {
  return request<{ staff: StaffDetail }>(`/${id}`, token);
}

export async function createStaff(token: string, input: CreateStaffInput) {
  return request<{ staff: StaffDetail }>("", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateStaff(token: string, id: string, input: UpdateStaffInput) {
  return request<{ staff: StaffDetail }>(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateStaffStatus(token: string, id: string, active: boolean) {
  return request<{ staff: StaffUser }>(`/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function sendStaffAccess(token: string, id: string, password: string) {
  return request<{ staff: StaffDetail; emailed: boolean }>(`/${id}/send-access`, token, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export { StaffApiError };
