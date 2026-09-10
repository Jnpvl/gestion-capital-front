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
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  rfc?: string | null;
  employerRepresentative?: string | null;
  workersRepresentative?: string | null;
}

export interface UpdateCompanyInput {
  name?: string;
  rfc?: string | null;
  employerRepresentative?: string | null;
  workersRepresentative?: string | null;
}

export interface CompaniesListResponse {
  companies: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
