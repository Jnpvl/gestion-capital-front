import type { StaffRole } from "@/core/domain/auth/types";

export type StaffGender = "male" | "female" | "other";

export const STAFF_GENDER_LABELS: Record<StaffGender, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

export interface StaffListItem {
  id: string;
  name: string;
  paternalLastName: string;
  maternalLastName: string | null;
  firstNames: string;
  email: string;
  role: StaffRole;
  age: number | null;
  gender: StaffGender | null;
  aceStpsRegistration: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
  signatureUrl: string | null;
  career: string | null;
  professionalArea: string | null;
  active: boolean;
  createdAt: string;
}

export interface StaffDetail extends StaffListItem {
  renapConocer: string | null;
  professionalLicense: string | null;
  professionalBio: string | null;
  updatedAt: string;
}

export interface CreateStaffInput {
  paternalLastName: string;
  maternalLastName?: string | null;
  firstNames: string;
  email: string;
  password: string;
  role: StaffRole;
  age?: number | null;
  gender?: StaffGender | null;
  aceStpsRegistration?: string | null;
  renapConocer?: string | null;
  professionalLicense?: string | null;
  photoUrl?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  career?: string | null;
  professionalArea?: string | null;
  professionalBio?: string | null;
  active?: boolean;
}

export interface UpdateStaffInput {
  paternalLastName?: string;
  maternalLastName?: string | null;
  firstNames?: string;
  email?: string;
  password?: string;
  role?: StaffRole;
  age?: number | null;
  gender?: StaffGender | null;
  aceStpsRegistration?: string | null;
  renapConocer?: string | null;
  professionalLicense?: string | null;
  photoUrl?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  career?: string | null;
  professionalArea?: string | null;
  professionalBio?: string | null;
  active?: boolean;
}

export interface StaffListResponse {
  staff: StaffListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function formatStaffFullName(input: {
  paternalLastName: string;
  maternalLastName?: string | null;
  firstNames: string;
}): string {
  return [input.paternalLastName, input.maternalLastName, input.firstNames]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}
