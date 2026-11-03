import type { ApiErrorBody } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
}

export class CompanyAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "CompanyAuthError";
  }
}

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new CompanyAuthError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }
  return data as T;
}

export async function companyLogin(email: string, password: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/company/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parse<{ token: string; user: CompanyUser }>(response);
}

export async function getCompanyMe(token: string) {
  const response = await fetch(`${env.apiUrl}/api/auth/company/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parse<{ user: CompanyUser }>(response);
}
