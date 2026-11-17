import { companyFetch } from "./session-fetch";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import type {
  CompanyCourseDetail,
  CompanyCourseSummary,
  CompanyDetail,
} from "@/core/domain/companies/types";
import type {
  CompanyDashboardResponse,
  EmployeeFormDetail,
  EmployeesFormsSummaryResponse,
  FormDefinition,
  FormKey,
} from "@/core/domain/forms/types";
import type {
  CompanyPsychologist,
  EmployeeReferral,
  EmployeeReferralPayload,
  PsychologistInput,
} from "@/core/domain/referrals/types";
import type { StudentDetail, StudentEnrollment, StudentsListResponse } from "@/core/domain/students/types";
import { companyAuthStorage } from "@/infrastructure/auth/company-auth-storage";
import { env } from "@/shared/config/env";

/**
 * Portal de empresa. Usa el token de empresa; la empresa sale del token
 * en el back, por eso ningún endpoint recibe companyId.
 */
export class CompanyPortalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CompanyPortalApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = companyAuthStorage.getToken();
  if (!token) throw new CompanyPortalApiError("No hay sesión activa", 401);
  const response = await companyFetch(`${env.apiUrl}/api/company${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new CompanyPortalApiError(error?.error?.message ?? "Error en la solicitud", response.status);
  }
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export type PortalCompany = Omit<CompanyDetail, "accessEmail" | "hasAccess" | "lastLoginAt">;

export function getPortalCompany() {
  return get<{ company: PortalCompany }>("/profile");
}

export function listPortalEmployees(params: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return get<StudentsListResponse>(`/employees?${qs.toString()}`);
}

export function getPortalEmployeesFormsSummary(studentIds: string[], year = new Date().getFullYear()) {
  const qs = `?year=${year}&studentIds=${encodeURIComponent(studentIds.join(","))}`;
  return get<EmployeesFormsSummaryResponse>(`/employees/forms-summary${qs}`);
}

export function getPortalEmployeeFormDetail(studentId: string, formKey: FormKey, year = new Date().getFullYear()) {
  return get<EmployeeFormDetail>(`/employees/${studentId}/forms/${formKey}?year=${year}`);
}

export function getPortalForm(key: string) {
  return get<{ form: FormDefinition }>(`/forms/${key}`);
}

export function getPortalFormResults(year?: number | string) {
  const qs = year != null ? `?year=${encodeURIComponent(String(year))}` : "";
  return get<CompanyDashboardResponse>(`/forms/results${qs}`);
}

export function getPortalCourses() {
  return get<{ companyId: string; courses: CompanyCourseSummary[] }>("/courses");
}

export function getPortalCourseDetail(courseId: string) {
  return get<CompanyCourseDetail>(`/courses/${encodeURIComponent(courseId)}`);
}

export type PortalEmployee = Pick<StudentDetail, "id" | "name" | "paternalLastName" | "maternalLastName" | "firstNames" | "email" | "phone" | "curp" | "gender" | "age" | "residenceLocation" | "educationLevel" | "professionArea" | "educationInstitution" | "currentlyEmployed" | "jobType" | "currentPosition" | "industrySector" | "yearsExperience" | "timeInCurrentPosition" | "stpsOccupationCode" | "stpsOccupationName" | "stpsThematicAreaCode" | "stpsThematicAreaName" | "companyId" | "companyName" | "companyRfc">;
export function getPortalEmployeeDetail(studentId: string) {
  return get<{ student: PortalEmployee; enrollments: StudentEnrollment[] }>(`/employees/${encodeURIComponent(studentId)}`);
}

export function listPortalPsychologists() {
  return get<{ psychologists: CompanyPsychologist[] }>("/psychologists");
}

export function createPortalPsychologist(input: PsychologistInput) {
  return request<{ psychologist: CompanyPsychologist }>("/psychologists", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePortalPsychologist(psychologistId: string, input: PsychologistInput) {
  return request<{ psychologist: CompanyPsychologist }>(
    `/psychologists/${encodeURIComponent(psychologistId)}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}

export function deletePortalPsychologist(psychologistId: string) {
  return request<{ ok: boolean }>(`/psychologists/${encodeURIComponent(psychologistId)}`, {
    method: "DELETE",
  });
}

export function getPortalEmployeeReferral(studentId: string, year: number | string) {
  return get<{ psychologists: CompanyPsychologist[]; referral: EmployeeReferral | null }>(
    `/employees/${encodeURIComponent(studentId)}/referral?year=${encodeURIComponent(String(year))}`,
  );
}

export function savePortalEmployeeReferral(
  studentId: string,
  year: number | string,
  input: EmployeeReferralPayload,
) {
  return request<{ referral: EmployeeReferral }>(
    `/employees/${encodeURIComponent(studentId)}/referral?year=${encodeURIComponent(String(year))}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}
