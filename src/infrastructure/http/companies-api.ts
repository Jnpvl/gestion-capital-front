import { staffFetch } from "./session-fetch";
import type { ApiErrorBody, ApiFieldError } from "@/core/domain/auth/types";
import type {
  CompaniesListResponse,
  CompanyAccessInput,
  CompanyAutocompleteItem,
  CompanyDetail,
  CompanyEmployeeImportResult,
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
    public readonly fields: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "CompaniesApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await staffFetch(`${env.apiUrl}/api/admin/companies${path}`, {
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
      error?.error?.fields ?? [],
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

export async function updateCompanyAccess(token: string, id: string, input: CompanyAccessInput) {
  return request<{ company: CompanyDetail }>(`/${id}/access`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export { CompaniesApiError };

export async function downloadCompanyEmployeesTemplate(companyId: string) {
  const token = authStorage.getToken();
  if (!token) throw new CompaniesApiError("No hay sesión activa", 401);

  const response = await staffFetch(
    `${env.apiUrl}/api/admin/companies/${companyId}/employees/template`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new CompaniesApiError(
      error?.error?.message ?? "No se pudo descargar la plantilla",
      response.status,
      error?.error?.code,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla-empleados.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importCompanyEmployees(
  companyId: string,
  file: File,
  options: { sendWelcomeEmail?: boolean } = {},
): Promise<CompanyEmployeeImportResult> {
  const token = authStorage.getToken();
  if (!token) throw new CompaniesApiError("No hay sesión activa", 401);

  const formData = new FormData();
  formData.append("sendWelcomeEmail", options.sendWelcomeEmail ? "true" : "false");
  formData.append("file", file);
  const response = await staffFetch(
    `${env.apiUrl}/api/admin/companies/${companyId}/employees/import`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new CompaniesApiError(
      error?.error?.message ?? "No se pudo importar el Excel",
      response.status,
      error?.error?.code,
    );
  }
  return data as CompanyEmployeeImportResult;
}

export interface SendEmployeeAccessResult {
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  activated: number;
  results: {
    studentId: string;
    name: string;
    email: string;
    status: "sent" | "skipped" | "failed";
    reason?: string;
  }[];
}

/** Correo de accesos a empleados (genera contraseña nueva). dryRun solo cuenta. */
export async function sendCompanyEmployeesAccess(
  token: string,
  companyId: string,
  input: { studentIds?: string[]; all?: boolean; activateInactive?: boolean },
) {
  return request<SendEmployeeAccessResult>(`/${companyId}/employees/send-access`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function previewCompanyEmployeesAccess(
  token: string,
  companyId: string,
  input: { studentIds?: string[]; all?: boolean },
) {
  return request<{ total: number; inactive: number; withoutEmail: number }>(
    `/${companyId}/employees/send-access`,
    token,
    { method: "POST", body: JSON.stringify({ ...input, dryRun: true }) },
  );
}
