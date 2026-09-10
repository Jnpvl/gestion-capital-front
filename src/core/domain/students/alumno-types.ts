export type AlumnoType = "estudiante" | "particular" | "trabajador";

export const ALUMNO_TYPE_OPTIONS: Array<{ value: AlumnoType; label: string }> = [
  { value: "estudiante", label: "Estudiante" },
  { value: "particular", label: "Particular" },
  { value: "trabajador", label: "Trabajador" },
];

export const ALUMNO_TYPE_LABELS: Record<AlumnoType, string> = {
  estudiante: "Estudiante",
  particular: "Particular",
  trabajador: "Trabajador",
};
