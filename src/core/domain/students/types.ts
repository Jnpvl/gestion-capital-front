export type EnrollmentStatus = "active" | "revoked" | "expired";

export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  coursesCount: number;
  createdAt: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  expiresAt: string | null;
}

export interface CreateStudentInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  notes?: string;
  active?: boolean;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  notes?: string | null;
  active?: boolean;
}

export interface StudentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentsListResponse {
  students: StudentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
