// Copia de gestion-capital-back/src/shared/forms/types.ts (mantener sincronizado).
export type FormKey =
  | "nom035_guia1"
  | "nom035_guia2"
  | "nom035_guia3"
  | "nom035_guia4"
  | "nom035_guia5";

/** yesno: Sí/No (Guía I y preguntas filtro). frequency: Siempre…Nunca. none: ficha de datos. */
export type FormScale = "yesno" | "frequency" | "none";

export type RiskLevel = "nulo" | "bajo" | "medio" | "alto" | "muy_alto";

export interface FormOption {
  value: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  /** Número de ítem según la norma (Guías II y III). */
  number?: number;
  text: string;
  /**
   * Texto para reportes/resultados cuando el documento lo pide distinto al del cuestionario.
   * Si no existe, se usa `text`.
   */
  resultQuestion?: string;
  /** Por defecto se usa la escala del formulario. */
  kind?: "yesno" | "choice" | "text";
  options?: FormOption[];
  note?: string;
}

export type SectionCondition =
  | { questionId: string; equals: string }
  | { anyYesInSection: string };

export interface FormSection {
  id: string;
  title?: string;
  instructions?: string;
  showIf?: SectionCondition;
  questions: FormQuestion[];
}

export interface ScoringDimension {
  name: string;
  items: number[];
}

export interface ScoringDomain {
  key: string;
  name: string;
  /** Límites [bajo, medio, alto, muy alto]: valor < c[0] = nulo, ≥ c[3] = muy alto. */
  cutoffs: [number, number, number, number] | number[];
  dimensions: ScoringDimension[];
}

export interface ScoringCategory {
  key: string;
  name: string;
  cutoffs: [number, number, number, number] | number[];
  domains: ScoringDomain[];
}

export interface FormScoring {
  /** Ítems calificados Siempre=0 … Nunca=4. El resto: Siempre=4 … Nunca=0. */
  positiveItems: number[];
  finalCutoffs: number[];
  categories: ScoringCategory[];
}

export interface ClinicalRule {
  screeningSection: string;
  thresholds: { sectionId: string; minYes: number }[];
}

export interface FormDefinition {
  key: FormKey;
  norm: string;
  title: string;
  subtitle: string;
  description: string;
  instructions?: string;
  scale: FormScale;
  sections: FormSection[];
  scoring?: FormScoring;
  clinicalRule?: ClinicalRule;
  /** PDF de referencia (vista previa / descarga). */
  documentUrl?: string;
}

export type FormAnswers = Record<string, string>;

export interface FormSummary {
  key: FormKey;
  norm: string;
  title: string;
  subtitle: string;
  description: string;
  questions: number;
  items: number;
}

export interface FormAssignmentSummary {
  id: string;
  companyId: string;
  formKeys: FormKey[];
  evaluationYear: number;
  dueAt: string | null;
  createdAt: string;
  employeesTotal: number;
  employeesCompleted: number;
  responsesTotal: number;
  responsesCompleted: number;
}

/** Cómo se aplica una guía asignada (I/II/III). Guía V no usa modo. */
export type FormMode = "admin_applied" | "self";

export const FORM_MODE_LABEL: Record<FormMode, string> = {
  admin_applied: "La aplico yo",
  self: "La contesta el empleado",
};

export const FORM_MODE_HINT: Record<FormMode, string> = {
  admin_applied: "Las respuestas se capturan en el admin; el empleado no la ve.",
  self: "Aparece en el portal del empleado (Mis cursos) para que la conteste.",
};

export type GuideSamplingMode = "census" | "sample";

export interface GuideSamplingInfo {
  mode: GuideSamplingMode;
  populationN: number;
  sampleN: number;
  stratumField: string;
  selectedStudentIds: string[];
}

export function samplingBadgeLabel(info: GuideSamplingInfo | null | undefined): string | null {
  if (!info) return null;
  if (info.mode === "sample") {
    return `Muestreo · ${info.sampleN} / ${info.populationN} trabajadores`;
  }
  return `Censo · ${info.populationN} / ${info.populationN} trabajadores`;
}

export interface FormGuideProgress {
  formKey: FormKey;
  mode: FormMode;
  assignmentId: string;
  assignedAt: string;
  dueAt: string | null;
  employeesTotal: number;
  completed: number;
  partial: number;
  pending: number;
  sampling?: GuideSamplingInfo | null;
}

export interface CompanyFormsResponse {
  evaluationYear: number;
  evaluationYears: number[];
  guideProgress: FormGuideProgress[];
  /** Guías (I/II/III) ya asignadas a la empresa en el año seleccionado. */
  assignedFormKeys: FormKey[];
  /** Empleados que ya empezaron cada guía (no se puede desasignar si > 0). */
  guidesInUse: Partial<Record<FormKey, number>>;
  workersCount: number | null;
  employeesLinked: number;
  suggestedFormKeys: FormKey[];
  suggestionBasis: "workersCount" | "employeesLinked";
  forms: FormSummary[];
  assignments: FormAssignmentSummary[];
}

export const FREQUENCY_OPTIONS = [
  { value: "siempre", label: "Siempre" },
  { value: "casi_siempre", label: "Casi siempre" },
  { value: "algunas_veces", label: "Algunas veces" },
  { value: "casi_nunca", label: "Casi nunca" },
  { value: "nunca", label: "Nunca" },
];

export const YES_NO_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

export function isSectionVisible(
  section: FormSection,
  answers: FormAnswers,
  form: FormDefinition,
): boolean {
  const cond = section.showIf;
  if (!cond) return true;
  if ("questionId" in cond) return answers[cond.questionId] === cond.equals;
  const target = form.sections.find((s) => s.id === cond.anyYesInSection);
  return !!target?.questions.some((q) => answers[q.id] === "si");
}

export function suggestionRuleLabel(workersCount: number | null): string {
  if (!workersCount) return "Sin número de trabajadores capturado: se sugiere Guía I.";
  if (workersCount <= 15) return "Hasta 15 trabajadores: Guía I.";
  if (workersCount <= 50) return "De 16 a 50 trabajadores: Guía I y Guía II.";
  return "Más de 50 trabajadores: Guía I y Guía III.";
}

export const FORM_SHORT_LABEL: Record<FormKey, string> = {
  nom035_guia1: "Guía I",
  nom035_guia2: "Guía II",
  nom035_guia3: "Guía III",
  nom035_guia4: "Guía IV",
  nom035_guia5: "Guía V",
};

export type EmployeeFormStatus =
  | "completed"
  | "partial"
  | "pending"
  | "not_applied"
  | "not_selected";

export const EMPLOYEE_FORM_STATUS_LABEL: Record<EmployeeFormStatus, string> = {
  completed: "Completa",
  partial: "Parcial",
  pending: "Pendiente",
  not_applied: "Sin aplicar",
  not_selected: "No seleccionado (muestreo)",
};

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  nulo: "Nulo o despreciable",
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  muy_alto: "Muy alto",
};

/** Resumen del resultado (Guías II/III: nivel y puntos; Guía I: valoración clínica). */
export interface FormResultSummary {
  traumaticEventReported?: boolean;
  total?: number;
  level?: RiskLevel;
  requiresClinicalAssessment?: boolean;
  resultText?: string;
  action: string;
}

/**
 * Semáforo NOM-035 (Guías II y III):
 * Nulo #04B6D4 · Bajo #22C45F · Medio #EBB308 · Alto #FA7317 · Muy alto #EF4545.
 * Texto blanco sobre el color de fondo.
 */
export const RISK_LEVEL_COLOR: Record<RiskLevel, { background: string; color: string }> = {
  nulo: { background: "#04B6D4", color: "#FFFFFF" },
  bajo: { background: "#22C45F", color: "#FFFFFF" },
  medio: { background: "#EBB308", color: "#FFFFFF" },
  alto: { background: "#FA7317", color: "#FFFFFF" },
  muy_alto: { background: "#EF4545", color: "#FFFFFF" },
};

/**
 * Guía I (acontecimiento traumático severo):
 * Rojo si requiere valoración · gris #cbd5e1 si no requiere
 * (mismo tono que “sin evaluación completa” en Guía V).
 */
export const CLINICAL_RESULT_COLOR = {
  requires: { background: "#EF4545", color: "#FFFFFF" },
  none: { background: "#cbd5e1", color: "#2A2A2E" },
} as const;

export function clinicalResultColor(requires: boolean): { background: string; color: string } {
  return requires ? CLINICAL_RESULT_COLOR.requires : CLINICAL_RESULT_COLOR.none;
}

/** Guía I: texto literal de la regla GR.I. */
export function clinicalResultText(requires: boolean): string {
  return requires
    ? "El trabajador requerirá atención clínica"
    : "El trabajador no requiere una valoración clínica";
}

export function formResultLine(result: FormResultSummary | null | undefined): string | null {
  if (!result) return null;
  if (result.requiresClinicalAssessment != null) {
    return result.resultText ?? clinicalResultText(result.requiresClinicalAssessment);
  }
  if (result.level) return `Resultado: ${RISK_LEVEL_LABEL[result.level]} (${result.total ?? 0} pts)`;
  return null;
}

export interface EmployeeFormState {
  formKey: FormKey;
  status: EmployeeFormStatus;
  result?: FormResultSummary | null;
}

export interface ScoredGroup {
  key: string;
  name: string;
  value: number;
  level: RiskLevel;
}

export interface DashboardFormResult {
  traumaticEventReported?: boolean | null;
  total: number | null;
  level: RiskLevel | null;
  levelLabel: string | null;
  requiresClinicalAssessment: boolean | null;
  resultText: string | null;
  action: string;
  categories: ScoredGroup[];
  domains: (ScoredGroup & { categoryKey: string })[];
  completedAt: string | null;
  updatedAt: string;
  formTitle: string;
}

export interface DashboardFormCell {
  status: EmployeeFormStatus | "not_assigned";
  result: DashboardFormResult | null;
}

export interface DashboardEmployee {
  studentId: string;
  employeeName: string;
  forms: Record<FormKey, DashboardFormCell>;
}

export type DemographicRiskGuide = "nom035_guia2" | "nom035_guia3";
export type DemographicRiskCounts = Record<RiskLevel | "sin_resultado", number>;
export interface DashboardDemographics {
  riskGuides?: DemographicRiskGuide[];
  total: number;
  completed: number;
  partial: number;
  fields: { key: string; name: string; answered: number; groups: { name: string; count: number; studentIds?: string[]; risks?: Partial<Record<DemographicRiskGuide, DemographicRiskCounts>> }[] }[];
}

/** Conteos de “Sí” por pregunta de Guía I, segmentados por sexo (Guía V). */
export interface Guide1GenderCounts {
  men: number;
  women: number;
  other: number;
  unspecified: number;
  total: number;
}

export interface Guide1Person {
  studentId: string;
  name: string;
}

export interface Guide1QuestionPeople {
  men: Guide1Person[];
  women: Guide1Person[];
  other: Guide1Person[];
  unspecified: Guide1Person[];
  all: Guide1Person[];
}

export interface Guide1QuestionSummary extends Guide1GenderCounts {
  id: string;
  text: string;
  people: Guide1QuestionPeople;
}

export interface Guide1SectionSummary {
  id: string;
  title: string;
  instructions: string | null;
  totalYes: number;
  questions: Guide1QuestionSummary[];
}

export interface Guide1ResponseSummary {
  evaluated: number;
  sections: Guide1SectionSummary[];
}

export interface CompanyDashboardResponse {
  evaluationYear: number;
  evaluationYears: number[];
  demographics?: DashboardDemographics;
  guide1ResponseSummary?: Guide1ResponseSummary | null;
  assignedFormKeys: FormKey[];
  sampling?: {
    nom035_guia3?: GuideSamplingInfo | null;
  };
  employees: DashboardEmployee[];
}

export interface EmployeesFormsSummaryResponse {
  employees: Record<string, EmployeeFormState[]>;
}

export interface EmployeeFormDetail {
  formKey: FormKey;
  answers: FormAnswers;
  status: EmployeeFormStatus;
  updatedAt: string | null;
}
