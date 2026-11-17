export interface CompanyPsychologist {
  id: string;
  companyId: string;
  name: string;
  license: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  inUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PsychologistInput {
  name: string;
  license: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface EmployeeReferralSession {
  id?: string;
  psychologistId: string;
  datetime: string;
  status: "Programada" | "Realizada" | "Cancelada";
  notes: string | null;
}

export interface EmployeeReferralClosure {
  psychologistId: string | null;
  conclusion: string | null;
  recommendations: string | null;
  resolution: "Alta" | "Seguimiento" | null;
}

export interface EmployeeReferral {
  id: string;
  status: string;
  evaluationYear: number;
  closure: EmployeeReferralClosure;
  sessions: EmployeeReferralSession[];
  updatedAt: string;
}

export interface EmployeeReferralPayload {
  status: string;
  sessions: EmployeeReferralSession[];
  closure?: EmployeeReferralClosure | null;
}
