import {
  RISK_LEVEL_LABEL,
  type CompanyDashboardResponse,
  type DashboardEmployee,
  type FormKey,
} from "@/core/domain/forms/types";

export interface ReferralReason {
  key: FormKey;
  title: string;
  descriptions: string[];
}

const GUIDE_TITLES: Record<"nom035_guia1" | "nom035_guia2" | "nom035_guia3", string> = {
  nom035_guia1: "Guía I",
  nom035_guia2: "Guía II",
  nom035_guia3: "Guía III",
};

/** Motivos de canalización a partir de resultados NOM-035 (mismas reglas que el tab Canalizaciones). */
export function getReferralReasons(
  employee: DashboardEmployee | undefined,
  data?: Pick<CompanyDashboardResponse, "assignedFormKeys" | "sampling"> | null,
): ReferralReason[] {
  if (!employee) return [];
  const assigned = new Set(data?.assignedFormKeys ?? []);
  const sample = data?.sampling?.nom035_guia3;
  const reasons: ReferralReason[] = [];

  if (assigned.has("nom035_guia1") || !data) {
    const cell = employee.forms.nom035_guia1;
    if (cell?.status === "completed" && cell.result?.requiresClinicalAssessment === true) {
      reasons.push({
        key: "nom035_guia1",
        title: GUIDE_TITLES.nom035_guia1,
        descriptions: ["Requiere valoración clínica"],
      });
    }
  }

  for (const key of ["nom035_guia2", "nom035_guia3"] as const) {
    if (data && !assigned.has(key)) continue;
    if (
      key === "nom035_guia3" &&
      sample?.mode === "sample" &&
      !sample.selectedStudentIds.includes(employee.studentId)
    ) {
      continue;
    }
    const cell = employee.forms[key];
    const result = cell?.result;
    if (cell?.status !== "completed" || !result || result.total == null || !Number.isFinite(result.total) || !result.level) {
      continue;
    }
    const violence = result.domains.find((domain) => domain.key === "violencia");
    const descriptions: string[] = [];
    if (result.level === "alto" || result.level === "muy_alto") {
      descriptions.push(
        `Calificación general: ${RISK_LEVEL_LABEL[result.level]} · ${result.total} puntos`,
      );
    }
    if (violence && (violence.level === "alto" || violence.level === "muy_alto")) {
      descriptions.push(
        `Violencia laboral: ${RISK_LEVEL_LABEL[violence.level]} · ${violence.value} puntos`,
      );
    }
    if (descriptions.length) {
      reasons.push({ key, title: GUIDE_TITLES[key], descriptions });
    }
  }

  return reasons;
}
