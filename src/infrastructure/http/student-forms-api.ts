import { studentFetch } from "./session-fetch";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import type { FormAnswers, FormDefinition, FormKey } from "@/core/domain/forms/types";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import { env } from "@/shared/config/env";

/** Formularios que contesta el empleado. El back toma alumno y empresa del token. */
export class StudentFormsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StudentFormsApiError";
  }
}

export interface StudentPendingForm {
  formKey: FormKey;
  title: string;
  subtitle: string;
  description?: string;
  status: "pending" | "in_progress";
  answeredCount: number;
  dueAt: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = studentAuthStorage.getToken();
  if (!token) throw new StudentFormsApiError("No hay sesión activa", 401);
  const response = await studentFetch(`${env.apiUrl}/api/student/forms${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new StudentFormsApiError(
      error?.error?.message ?? "Error en la solicitud",
      response.status,
      error?.error?.code,
    );
  }
  return data as T;
}

export function listPendingForms() {
  return request<{ forms: StudentPendingForm[] }>("");
}

export function getStudentForm(formKey: string) {
  return request<{ form: FormDefinition; answers: FormAnswers; status: string }>(`/${formKey}`);
}

export function saveStudentForm(
  formKey: string,
  answers: FormAnswers,
  finalize = false,
  /** keepalive: la petición sobrevive al cerrar/salir de la página. */
  keepalive = false,
) {
  return request<{ formKey: FormKey; status: "pending" | "in_progress" | "completed" }>(`/${formKey}`, {
    method: "PUT",
    body: JSON.stringify({ answers, finalize }),
    keepalive,
  });
}
