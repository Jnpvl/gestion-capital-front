import type { StaffRole } from "@/core/domain/auth/types";

export interface StaffListItem {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  active?: boolean;
}

export interface StaffListResponse {
  staff: StaffListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
