import type {
  StudentLoginResponse,
  StudentMeResponse,
} from "@/core/domain/student/types";
import type { ApiErrorBody } from "@/core/domain/auth/types";
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

export async function studentLogin(email: string, password: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<StudentLoginResponse>(response);
}

export async function getStudentMe(token: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/student/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return parseResponse<StudentMeResponse>(response);
}

export async function acceptStudentPrivacy(token: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/student/privacy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<StudentMeResponse>(response);
}

export { ApiClientError };
