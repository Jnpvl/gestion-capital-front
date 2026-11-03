export interface CompanyAutocompleteItem {
  id: string;
  name: string;
  rfc: string | null;
}

export interface CompanyListItem extends CompanyAutocompleteItem {
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
}

export interface UpdateCompanyInput {
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
  status: "created" | "existing" | "linked" | "error";
  studentId?: string;
  message?: string;
}

export interface CompanyEmployeeImportResult {
  companyId: string;
  totalRows: number;
  created: number;
  existing: number;
  /** Alumnos que existían sin empresa y se vincularon. */
  linked?: number;
  errors: number;
  welcomeEmailSent: boolean;
  rows: CompanyEmployeeImportRowResult[];
}
