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
  GuideSamplingInfo,
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

export function getCompanyForms(companyId: string, year?: number | string) {
  const qs = year != null ? `?year=${encodeURIComponent(String(year))}` : "";
  return request<CompanyFormsResponse>(`/companies/${companyId}/forms${qs}`);
}

export function createFormAssignment(
  companyId: string,
  input: {
    formKeys: FormKey[];
    modes?: Partial<Record<FormKey, FormMode>>;
    guia3SamplingMode?: "census" | "sample";
    evaluationYear?: number;
    dueAt?: string | null;
  },
) {
  return request<{ assignment: FormAssignmentSummary; sampling?: GuideSamplingInfo | null }>(
    `/companies/${companyId}/forms/assignments`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getCompanyEmployeesFormsSummary(companyId: string, studentIds: string[], year = new Date().getFullYear()) {
  const qs = `?year=${year}&studentIds=${encodeURIComponent(studentIds.join(","))}`;
  return request<EmployeesFormsSummaryResponse>(
    `/companies/${companyId}/employees/forms-summary${qs}`,
  );
}

export function getEmployeeFormDetail(companyId: string, studentId: string, formKey: FormKey, year = new Date().getFullYear()) {
  return request<EmployeeFormDetail>(
    `/companies/${companyId}/employees/${studentId}/forms/${formKey}?year=${year}`,
  );
}

export function updateEmployeeForm(
  companyId: string,
  studentId: string,
  formKey: FormKey,
  answers: Record<string, string>,
  year = new Date().getFullYear(),
) {
  return request<EmployeeFormDetail>(
    `/companies/${companyId}/employees/${studentId}/forms/${formKey}?year=${year}`,
    { method: "PUT", body: JSON.stringify({ answers }) },
  );
}

export function getCompanyFormResults(companyId: string, year?: number | string) {
  const qs = year != null ? `?year=${encodeURIComponent(String(year))}` : "";
  return request<CompanyDashboardResponse>(`/companies/${companyId}/forms/results${qs}`);
}

export function setCompanyFormMode(
  companyId: string,
  formKey: FormKey,
  mode: FormMode,
  year?: number | string,
) {
  const qs = year != null ? `?year=${encodeURIComponent(String(year))}` : "";
  return request<{ formKey: FormKey; mode: FormMode }>(
    `/companies/${companyId}/forms/assignments/${formKey}/mode${qs}`,
    { method: "PUT", body: JSON.stringify({ mode }) },
  );
}

export function unassignCompanyForm(companyId: string, formKey: FormKey, year?: number | string) {
  const qs = year != null ? `?year=${encodeURIComponent(String(year))}` : "";
  return request<{ formKey: FormKey; unassigned: true }>(
    `/companies/${companyId}/forms/assignments/${formKey}${qs}`,
    { method: "DELETE" },
  );
}

export interface FormImportResult {
  dryRun: boolean;
  evaluationYear?: number;
  valid: number;
  imported: number;
  skipped: number;
  errors: number;
  rows: { row: number; employee: string; status: "valid" | "imported" | "skipped" | "error"; message: string }[];
}

async function excelRequest(
  companyId: string,
  key: FormKey,
  suffix: string,
  body?: FormData,
  year?: number,
) {
  const token = authStorage.getToken();
  if (!token) throw new FormsApiError("No hay sesión activa", 401);
  const qs = year != null && !body ? `?year=${encodeURIComponent(String(year))}` : "";
  const response = await staffFetch(
    `${env.apiUrl}/api/admin/companies/${companyId}/forms/${key}/${suffix}${qs}`,
    {
      method: body ? "POST" : "GET",
      body,
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new FormsApiError(data?.error?.message ?? "No se pudo procesar el Excel", response.status);
  }
  return response;
}
export async function downloadFormTemplate(companyId: string, key: FormKey, year?: number) {
  const response = await excelRequest(companyId, key, "template", undefined, year);
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `plantilla-${key}.xlsx`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importFormExcel(
  companyId: string,
  key: FormKey,
  file: File,
  dryRun: boolean,
  evaluationYear?: number,
): Promise<FormImportResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("dryRun", String(dryRun));
  if (evaluationYear != null) body.append("evaluationYear", String(evaluationYear));
  return (await excelRequest(companyId, key, "import", body)).json();
}
