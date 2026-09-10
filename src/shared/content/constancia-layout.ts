import type { CourseInstructorSnapshot, CourseModality } from "@/core/domain/courses/types";
import { MODALITY_LABELS } from "@/core/domain/courses/types";

export const CONSTANCIA_COPY = {
  otorgaA: "Otorga a:",
  curpLabel: "Con Clave Única de Registro de Población:",
  courseLabel: "Constancia de participación",
  durationLabel: "Duración:",
  modalityLabel: "Modalidad:",
  periodLabel: "Periodo:",
  licenseLabel: "Cédula Profesional:",
  folioLabel: "Folio:",
  disclaimer:
    "La presente constancia se expide como evidencia de la capacitación recibida, para los fines curriculares y laborales que al interesado convengan.",
  defaultIssuedPlace: "Ciudad de Guaymas, Sonora",
} as const;

export const CONSTANCIA_LAYOUT = {
  leftRatio: 0.18,
  contentWidthRatio: 0.7,
  otorgaA: { top: 17.8, fontSize: 17 },
  studentName: { top: 21.6, fontSize: 30 },
  curpLabel: { top: 28.2, fontSize: 16 },
  curp: { top: 31.4, fontSize: 18 },
  courseLabel: { top: 37.6, fontSize: 16 },
  courseTitle: { top: 41.0, fontSize: 20 },
  duration: { top: 48.2, fontSize: 14 },
  modality: { top: 51.4, fontSize: 14 },
  period: { top: 54.6, fontSize: 14 },
  issuedAt: { top: 58.8, fontSize: 14 },
  instructorSignature: { top: 66.4, maxHeightRatio: 0.07, maxWidthRatio: 0.32 },
  instructorName: { top: 74.0, fontSize: 16 },
  instructorSpecialty: { top: 77.0, fontSize: 13 },
  instructorLicense: { top: 79.6, fontSize: 13 },
  instructorLogo: { top: 81.8, maxHeightRatio: 0.095, maxWidthRatio: 0.28 },
  qr: { top: 70.5, minSizeRatio: 0.16, rightRatio: 0.78 },
  folio: { top: 88.5, fontSize: 13 },
  folioRightRatio: 0.7,
  disclaimer: { top: 93.2, fontSize: 11 },
} as const;

/** Paleta oficial de marca para constancias. */
export const CONSTANCIA_COLORS = {
  blue: "#2E3192",
  gray: "#2A2A2E",
  gold: "#CAA24B",
  red: "#D80022",
  black: "#000000",
  white: "#FFFFFF",
  label: "#6B6B70",
  text: "#2A2A2E",
} as const;

export const CONSTANCIA_PREVIEW_SAMPLE = {
  studentName: "NOMBRE DEL PARTICIPANTE",
  curp: "CURP DEL PARTICIPANTE",
  courseTitle: "NOMBRE DEL CURSO",
  duration: "20 horas",
  modality: "En línea",
  period: "12 al 14 de marzo de 2026",
  instructorName: "NOMBRE DEL INSTRUCTOR",
  instructorSpecialty: "Ocupación o especialidad",
  instructorLicense: "Cédula Profesional:",
  certificateNumber: "XXXXXXXX",
} as const;

export function formatConstanciaModality(modality?: CourseModality | null): string {
  if (!modality) return "—";
  return MODALITY_LABELS[modality];
}

export function formatConstanciaInstructorName(
  instructor?: CourseInstructorSnapshot | null,
): string {
  const name = instructor?.name?.trim() || CONSTANCIA_PREVIEW_SAMPLE.instructorName;
  return name.toLocaleUpperCase("es-MX");
}

export function formatConstanciaInstructorSpecialty(
  instructor?: CourseInstructorSnapshot | null,
): string {
  return (
    instructor?.professionalArea?.trim() ||
    instructor?.career?.trim() ||
    CONSTANCIA_PREVIEW_SAMPLE.instructorSpecialty
  );
}
