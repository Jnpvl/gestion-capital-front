export type EnrollmentStatus = "active" | "revoked" | "expired";
export type EnrollmentDeliveryMode = "online" | "presencial";

export const DELIVERY_MODE_LABELS: Record<EnrollmentDeliveryMode, string> = {
  online: "En línea",
  presencial: "Presencial",
};

export type { AlumnoType } from "@/core/domain/students/alumno-types";
export { ALUMNO_TYPE_LABELS, ALUMNO_TYPE_OPTIONS } from "@/core/domain/students/alumno-types";

export type {
  AlumnoGender,
  EducationLevel,
  JobType,
} from "@/core/domain/students/alumno-profile-options";
export {
  EDUCATION_LEVEL_LABELS,
  EDUCATION_LEVEL_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  JOB_TYPE_LABELS,
  JOB_TYPE_OPTIONS,
} from "@/core/domain/students/alumno-profile-options";

import type { AlumnoType } from "@/core/domain/students/alumno-types";
import type {
  AlumnoGender,
  EducationLevel,
  JobType,
} from "@/core/domain/students/alumno-profile-options";

export interface StudentListItem {
  id: string;
  name: string;
  paternalLastName?: string;
  maternalLastName?: string | null;
  firstNames?: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  alumnoType: AlumnoType;
  active: boolean;
  coursesCount: number;
  createdAt: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  paternalLastName: string;
  maternalLastName: string | null;
  firstNames: string;
  email: string;
  phone: string | null;
  notes: string | null;
  curp: string | null;
  gender: AlumnoGender | null;
  age: number | null;
  residenceLocation: string | null;
  educationLevel: EducationLevel | null;
  professionArea: string | null;
  educationInstitution: string | null;
  currentlyEmployed: boolean | null;
  jobType: JobType | null;
  currentPosition: string | null;
  industrySector: string | null;
  yearsExperience: number | null;
  timeInCurrentPosition: string | null;
  stpsOccupationCode: string | null;
  stpsOccupationName: string | null;
  stpsThematicAreaCode: string | null;
  stpsThematicAreaName: string | null;
  alumnoType: AlumnoType;
  companyId: string | null;
  companyName: string | null;
  companyRfc: string | null;
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
  enrolledViaCompany: boolean;
  deliveryMode: EnrollmentDeliveryMode;
  completedAt: string | null;
  completed: boolean;
  canDownloadCertificate: boolean;
  canDownloadDc3: boolean;
}

export interface CourseEnrollmentListItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseSlug: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  enrolledViaCompany: boolean;
  deliveryMode: EnrollmentDeliveryMode;
  completedAt: string | null;
  completed: boolean;
  progressPercent: number;
  canDownloadCertificate: boolean;
  canDownloadDc3: boolean;
  certificateNumber: string | null;
  periodLabel: string;
}

export interface CreateStudentInput {
  paternalLastName: string;
  maternalLastName?: string | null;
  firstNames: string;
  email: string;
  password: string;
  phone: string;
  notes?: string | null;
  alumnoType: AlumnoType;
  curp: string;
  gender: AlumnoGender;
  age: number;
  residenceLocation: string;
  educationLevel?: EducationLevel | null;
  professionArea?: string | null;
  educationInstitution?: string | null;
  currentlyEmployed?: boolean | null;
  jobType?: JobType | null;
  currentPosition?: string | null;
  industrySector?: string | null;
  yearsExperience?: number | null;
  timeInCurrentPosition?: string | null;
  stpsOccupationCode?: string | null;
  stpsThematicAreaCode?: string | null;
  companyId?: string | null;
  active?: boolean;
}

export interface UpdateStudentInput {
  paternalLastName?: string;
  maternalLastName?: string | null;
  firstNames?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  notes?: string | null;
  alumnoType?: AlumnoType;
  curp?: string | null;
  gender?: AlumnoGender | null;
  age?: number | null;
  residenceLocation?: string | null;
  educationLevel?: EducationLevel | null;
  professionArea?: string | null;
  educationInstitution?: string | null;
  currentlyEmployed?: boolean | null;
  jobType?: JobType | null;
  currentPosition?: string | null;
  industrySector?: string | null;
  yearsExperience?: number | null;
  timeInCurrentPosition?: string | null;
  stpsOccupationCode?: string | null;
  stpsThematicAreaCode?: string | null;
  companyId?: string | null;
  active?: boolean;
}

export type { CompanyAutocompleteItem as CompanyListItem } from "@/core/domain/companies/types";

export interface StpsOccupationItem {
  code: string;
  name: string;
  areaCode: string;
  areaName: string;
}

export interface StpsThematicAreaItem {
  code: string;
  name: string;
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

export function formatStudentFullName(input: {
  paternalLastName: string;
  maternalLastName?: string | null;
  firstNames: string;
}): string {
  return [input.paternalLastName, input.maternalLastName, input.firstNames]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}
