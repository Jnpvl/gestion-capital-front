import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  CompaniesListResponse,
  CompanyAutocompleteItem,
  CompanyDetail,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@/core/domain/companies/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { env } from "@/shared/config/env";

class CompaniesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "CompaniesApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}/api/admin/companies${path}`, {
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
    throw new CompaniesApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function autocompleteCompanies(search?: string) {
  const token = authStorage.getToken();
  if (!token) {
    throw new CompaniesApiError("No hay sesión activa", 401);
  }

  const query = new URLSearchParams();
  if (search?.trim()) query.set("search", search.trim());
  query.set("limit", "50");

  const qs = query.toString();
  return request<{ companies: CompanyAutocompleteItem[] }>(
    `/autocomplete${qs ? `?${qs}` : ""}`,
    token,
  );
}

export async function listCompanies(
  token: string,
  params?: {
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return request<CompaniesListResponse>(qs ? `?${qs}` : "", token);
}

export async function getCompany(token: string, id: string) {
  return request<{ company: CompanyDetail }>(`/${id}`, token);
}

export async function createCompany(token: string, input: CreateCompanyInput) {
  return request<{ company: CompanyDetail }>("", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCompany(token: string, id: string, input: UpdateCompanyInput) {
  return request<{ company: CompanyDetail }>(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export { CompaniesApiError };
