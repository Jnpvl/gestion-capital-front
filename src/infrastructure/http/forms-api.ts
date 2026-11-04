import { staffFetch } from "./session-fetch";
import type { ApiErrorBody, ApiFieldError } from "@/core/domain/auth/types";
import type {
  CompanyDashboardResponse,
  CompanyFormsResponse,
  EmployeeFormDetail,
  EmployeesFormsSummaryResponse,
  FormAssignmentSummary,
  FormDefinition,
  FormKey,
  FormMode,
  FormSummary,
} from "@/core/domain/forms/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { env } from "@/shared/config/env";

export class FormsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "FormsApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = authStorage.getToken();
  if (!token) throw new FormsApiError("No hay sesión activa", 401);
  const response = await staffFetch(`${env.apiUrl}/api/admin${path}`, {
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
    throw new FormsApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.fields ?? [],
    );
  }
  return data as T;
}

export function listForms() {
  return request<{ forms: FormSummary[] }>("/forms");
}

export function getForm(key: string) {
  return request<{ form: FormDefinition }>(`/forms/${key}`);
}

export function getCompanyForms(companyId: string) {
  return request<CompanyFormsResponse>(`/companies/${companyId}/forms`);
}

export function createFormAssignment(
  companyId: string,
  input: { formKeys: FormKey[]; modes?: Partial<Record<FormKey, FormMode>>; dueAt?: string | null },
) {
  return request<{ assignment: FormAssignmentSummary }>(`/companies/${companyId}/forms/assignments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCompanyEmployeesFormsSummary(companyId: string, studentIds: string[]) {
  const qs = studentIds.length ? `?studentIds=${encodeURIComponent(studentIds.join(","))}` : "";
  return request<EmployeesFormsSummaryResponse>(
    `/companies/${companyId}/employees/forms-summary${qs}`,
  );
}

export function getEmployeeFormDetail(companyId: string, studentId: string, formKey: FormKey) {
  return request<EmployeeFormDetail>(
    `/companies/${companyId}/employees/${studentId}/forms/${formKey}`,
  );
}

export function updateEmployeeForm(
  companyId: string,
  studentId: string,
  formKey: FormKey,
  answers: Record<string, string>,
) {
  return request<EmployeeFormDetail>(
    `/companies/${companyId}/employees/${studentId}/forms/${formKey}`,
    { method: "PUT", body: JSON.stringify({ answers }) },
  );
}

export function getCompanyFormResults(companyId: string) {
  return request<CompanyDashboardResponse>(`/companies/${companyId}/forms/results`);
}

export function setCompanyFormMode(companyId: string, formKey: FormKey, mode: FormMode) {
  return request<{ formKey: FormKey; mode: FormMode }>(
    `/companies/${companyId}/forms/assignments/${formKey}/mode`,
    { method: "PUT", body: JSON.stringify({ mode }) },
  );
}

export function unassignCompanyForm(companyId: string, formKey: FormKey) {
  return request<{ formKey: FormKey; unassigned: true }>(
    `/companies/${companyId}/forms/assignments/${formKey}`,
    { method: "DELETE" },
  );
}
