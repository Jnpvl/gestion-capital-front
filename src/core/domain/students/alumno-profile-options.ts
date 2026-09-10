export type AlumnoGender = "masculino" | "femenino" | "otro";

export type EducationLevel =
  | "sin_formacion"
  | "primaria"
  | "secundaria"
  | "preparatoria"
  | "tecnico_superior"
  | "licenciatura"
  | "maestria"
  | "doctorado";

export type JobType =
  | "operativo"
  | "profesional_tecnico"
  | "supervisor"
  | "gerente"
  | "otro";

export const GENDER_OPTIONS: Array<{ value: AlumnoGender; label: string }> = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

export const EDUCATION_LEVEL_OPTIONS: Array<{ value: EducationLevel; label: string }> = [
  { value: "sin_formacion", label: "Sin formación" },
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "preparatoria", label: "Preparatoria o Bachillerato" },
  { value: "tecnico_superior", label: "Técnico Superior" },
  { value: "licenciatura", label: "Licenciatura" },
  { value: "maestria", label: "Maestría" },
  { value: "doctorado", label: "Doctorado" },
];

export const JOB_TYPE_OPTIONS: Array<{ value: JobType; label: string }> = [
  { value: "operativo", label: "Operativo" },
  { value: "profesional_tecnico", label: "Profesional o técnico" },
  { value: "supervisor", label: "Supervisor" },
  { value: "gerente", label: "Gerente" },
  { value: "otro", label: "Otro" },
];

export const GENDER_LABELS: Record<AlumnoGender, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  sin_formacion: "Sin formación",
  primaria: "Primaria",
  secundaria: "Secundaria",
  preparatoria: "Preparatoria o Bachillerato",
  tecnico_superior: "Técnico Superior",
  licenciatura: "Licenciatura",
  maestria: "Maestría",
  doctorado: "Doctorado",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  operativo: "Operativo",
  profesional_tecnico: "Profesional o técnico",
  supervisor: "Supervisor",
  gerente: "Gerente",
  otro: "Otro",
};
