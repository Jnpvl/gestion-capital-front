export const CERTIFICATE_TEXT_LAYOUT = {
  studentName: { yRatio: 0.42, fontSize: 28, fontWeight: 700 },
  courseTitle: { yRatio: 0.52, fontSize: 18, fontWeight: 400 },
  completionDate: { yRatio: 0.6, fontSize: 14, fontWeight: 400 },
  certificateNumber: { yRatio: 0.68, fontSize: 12, fontWeight: 400 },
} as const;

export const DC3_TEXT_LAYOUT = {
  studentName: { yRatio: 0.42, fontSize: 28, fontWeight: 700 },
  companyName: { yRatio: 0.48, fontSize: 16, fontWeight: 400 },
  courseTitle: { yRatio: 0.54, fontSize: 18, fontWeight: 400 },
  completionDate: { yRatio: 0.62, fontSize: 14, fontWeight: 400 },
  certificateNumber: { yRatio: 0.7, fontSize: 12, fontWeight: 400 },
} as const;

export function certificateYRatioToCssTop(yRatio: number): number {
  return (1 - yRatio) * 100;
}

export function formatCertificatePreviewDate(date = new Date()): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const CERTIFICATE_PREVIEW_SAMPLE = {
  studentName: "Nombre del alumno",
  companyName: "Nombre de la empresa",
  certificateNumber: "GCH-2026-PREVIEW",
  dc3CertificateNumber: "GCH-DC3-2026-PREVIEW",
} as const;
