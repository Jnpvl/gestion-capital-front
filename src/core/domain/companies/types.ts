export interface CompanyAutocompleteItem {
  id: string;
  name: string;
  rfc: string | null;
}

export interface CompanyListItem extends CompanyAutocompleteItem {
  activityMain: string | null;
  employerRepresentative: string | null;
  studentsCount: number;
  createdAt: string;
}

export interface CompanyDetail {
  id: string;
  name: string;
  rfc: string | null;
  employerRepresentative: string | null;
  workersRepresentative: string | null;
  workersCount: number | null;
  address: string | null;
  addressStreet: string | null;
  addressExteriorNumber: string | null;
  addressInteriorNumber: string | null;
  addressNeighborhood: string | null;
  addressPostalCode: string | null;
  addressCity: string | null;
  addressMunicipality: string | null;
  addressState: string | null;
  addressCountry: string | null;
  addressBetweenStreet1: string | null;
  addressBetweenStreet2: string | null;
  /** Actividad principal del negocio. */
  activityMain: string | null;
  /** Correo de acceso al portal de empresa. */
  accessEmail: string | null;
  hasAccess: boolean;
  lastLoginAt: string | null;
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAccessInput {
  accessEmail: string;
  password?: string | null;
  sendAccessEmail?: boolean;
}

export interface CreateCompanyInput {
  name: string;
  accessEmail?: string | null;
  password?: string | null;
  sendAccessEmail?: boolean;
  rfc?: string | null;
  employerRepresentative?: string | null;
  workersRepresentative?: string | null;
  workersCount?: number | null;
  activityMain?: string | null;
  address?: string | null;
  addressStreet?: string | null;
  addressExteriorNumber?: string | null;
  addressInteriorNumber?: string | null;
  addressNeighborhood?: string | null;
  addressPostalCode?: string | null;
  addressCity?: string | null;
  addressMunicipality?: string | null;
  addressState?: string | null;
  addressCountry?: string | null;
  addressBetweenStreet1?: string | null;
  addressBetweenStreet2?: string | null;
}

export interface UpdateCompanyInput {
  activityMain?: string | null;
  address?: string | null;
  addressStreet?: string | null;
  addressExteriorNumber?: string | null;
  addressInteriorNumber?: string | null;
  addressNeighborhood?: string | null;
  addressPostalCode?: string | null;
  addressCity?: string | null;
  addressMunicipality?: string | null;
  addressState?: string | null;
  addressCountry?: string | null;
  addressBetweenStreet1?: string | null;
  addressBetweenStreet2?: string | null;
  name?: string;
  rfc?: string | null;
  employerRepresentative?: string | null;
  workersRepresentative?: string | null;
  workersCount?: number | null;
}

export interface CompaniesListResponse {
  companies: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompanyEmployeeImportRowResult {
  row: number;
  curp: string;
  name: string;
  email: string;
  status: "created" | "existing" | "updated" | "linked" | "error";
  studentId?: string;
  message?: string;
}

export interface CompanyCourseSummary {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  deliveryModes: ("online" | "presencial")[];
  activeCount: number;
  completedCount: number;
  employeesTotal: number;
  firstEnrolledAt: string | null;
  lastEnrolledAt: string | null;
}

export interface CompanyCourseMissingEmployee {
  studentId: string;
  name: string;
  email: string;
  reason: string;
}

export interface CompanyCourseDetailCourse {
  id: string;
  title: string;
  slug: string;
  activeCount: number;
  completedCount: number;
  employeesTotal: number;
  deliveryModes: ("online" | "presencial")[];
}

export interface CompanyCourseDetailEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  deliveryMode: "online" | "presencial";
  enrolledAt: string;
  completed: boolean;
  progressPercent: number;
  canDownloadCertificate: boolean;
  canDownloadDc3: boolean;
  certificateNumber: string | null;
  periodLabel: string;
}

export interface CompanyCourseDetail {
  companyId: string;
  course: CompanyCourseDetailCourse;
  enrollments: CompanyCourseDetailEnrollment[];
  missing: CompanyCourseMissingEmployee[];
}

export interface CompanyCourseAssignResult {
  courseId: string;
  courseTitle: string;
  deliveryMode: "online" | "presencial";
  enrolledViaCompany: true;
  total: number;
  assigned: number;
  upgraded: number;
  skipped: number;
  failed: number;
  results: {
    studentId: string;
    name: string;
    email: string;
    status: "assigned" | "upgraded" | "skipped" | "failed";
    reason?: string;
  }[];
  courses: CompanyCourseSummary[];
}

export interface CompanyEmployeeImportResult {
  companyId: string;
  totalRows: number;
  created: number;
  existing: number;
  /** Empleados existentes a los que se les guardó Guía V del año seleccionado. */
  updated?: number;
  /** Alumnos que existían sin empresa y se vincularon. */
  linked?: number;
  errors: number;
  evaluationYear?: number | null;
  welcomeEmailSent: boolean;
  rows: CompanyEmployeeImportRowResult[];
}
