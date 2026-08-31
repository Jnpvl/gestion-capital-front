export type StaffRole = "admin" | "teacher";

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
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[] | undefined>;
  };
}
