export type StaffRole = "super_admin" | "admin" | "teacher";

export function isElevatedStaffRole(role: StaffRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

export interface StaffLoginResponse {
  token: string;
  user: StaffUser;
}

export interface StaffMeResponse {
  user: StaffUser;
}

export interface ApiErrorBody {
  error?: {
    message?: string;
    code?: string;
    details?: Record<string, string[] | undefined>;
    /** Errores por campo: { field, label, message } (validación y duplicados). */
    fields?: ApiFieldError[];
  };
}

export interface ApiFieldError {
  field: string;
  label: string;
  message: string;
}
