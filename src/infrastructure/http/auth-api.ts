import type {
  ApiErrorBody,
  StaffLoginResponse,
  StaffMeResponse,
} from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new ApiClientError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function staffLogin(email: string, password: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/staff/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<StaffLoginResponse>(response);
}

export async function getStaffMe(token: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/staff/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse<StaffMeResponse>(response);
}

export { ApiClientError };
