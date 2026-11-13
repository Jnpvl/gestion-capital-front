import type {
  CompanyDashboardResponse,
  DashboardDemographics,
  Guide1Person,
  Guide1ResponseSummary,
} from "@/core/domain/forms/types";

export const DEMOGRAPHIC_FILTER_ALL = "";
export const DEMOGRAPHIC_FILTER_UNSPECIFIED = "__sin_especificar__";

export type DemographicFieldKey = "departamento" | "puesto";

export interface DemographicFilterOption {
  value: string;
  label: string;
  count: number;
}

function fieldGroups(demographics: DashboardDemographics | undefined, key: DemographicFieldKey) {
  return demographics?.fields.find((field) => field.key === key)?.groups ?? [];
}

function inScope(studentId: string, scopeIds: Set<string> | null | undefined) {
  return !scopeIds || scopeIds.has(studentId);
}

/**
 * Opciones de filtro (incluye “Sin especificar”).
 * Si `scopeIds` viene del otro filtro, solo lista valores con personas en ese alcance
 * y recalcula contadores.
 */
export function demographicFilterOptions(
  demographics: DashboardDemographics | undefined,
  employees: { studentId: string }[],
  key: DemographicFieldKey,
  scopeIds?: Set<string> | null,
): DemographicFilterOption[] {
  const groups = fieldGroups(demographics, key);
  const covered = new Set(groups.flatMap((group) => group.studentIds ?? []));
  const options: DemographicFilterOption[] = [];

  for (const group of groups) {
    const count = (group.studentIds ?? []).filter((id) => inScope(id, scopeIds)).length;
    if (count === 0) continue;
    options.push({ value: group.name, label: group.name, count });
  }

  const unspecifiedCount = employees.filter(
    (employee) => !covered.has(employee.studentId) && inScope(employee.studentId, scopeIds),
  ).length;
  if (unspecifiedCount > 0) {
    options.push({
      value: DEMOGRAPHIC_FILTER_UNSPECIFIED,
      label: "Sin especificar",
      count: unspecifiedCount,
    });
  }

  return options.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

/** Empleados que cumplen un valor de filtro (`null` = Todos). */
export function demographicSelectionIds(
  demographics: DashboardDemographics | undefined,
  employees: { studentId: string }[],
  key: DemographicFieldKey,
  value: string,
): Set<string> | null {
  if (!value) return null;
  if (value === DEMOGRAPHIC_FILTER_UNSPECIFIED) {
    const covered = new Set(fieldGroups(demographics, key).flatMap((group) => group.studentIds ?? []));
    return new Set(
      employees
        .filter((employee) => !covered.has(employee.studentId))
        .map((employee) => employee.studentId),
    );
  }
  const group = fieldGroups(demographics, key).find((item) => item.name === value);
  return new Set(group?.studentIds ?? []);
}

/** `null` = sin filtro (mostrar todos). */
export function resolveDemographicAllowedIds(
  demographics: DashboardDemographics | undefined,
  employees: { studentId: string }[],
  departamento: string,
  puesto: string,
): Set<string> | null {
  const byDept = demographicSelectionIds(demographics, employees, "departamento", departamento);
  const byPuesto = demographicSelectionIds(demographics, employees, "puesto", puesto);
  if (!byDept && !byPuesto) return null;
  if (byDept && !byPuesto) return byDept;
  if (!byDept && byPuesto) return byPuesto;
  const intersection = new Set<string>();
  for (const id of byDept!) {
    if (byPuesto!.has(id)) intersection.add(id);
  }
  return intersection;
}

function filterPeople(people: Guide1Person[], allowed: Set<string>): Guide1Person[] {
  return people.filter((person) => allowed.has(person.studentId));
}

export function filterGuide1ResponseSummary(
  summary: Guide1ResponseSummary | null | undefined,
  allowed: Set<string> | null,
  evaluated: number,
): Guide1ResponseSummary | null | undefined {
  if (!summary || !allowed) return summary;
  return {
    evaluated,
    sections: summary.sections.map((section) => {
      const questions = section.questions.map((question) => {
        const people = {
          men: filterPeople(question.people.men, allowed),
          women: filterPeople(question.people.women, allowed),
          other: filterPeople(question.people.other, allowed),
          unspecified: filterPeople(question.people.unspecified, allowed),
          all: filterPeople(question.people.all, allowed),
        };
        return {
          ...question,
          men: people.men.length,
          women: people.women.length,
          other: people.other.length,
          unspecified: people.unspecified.length,
          total: people.all.length,
          people,
        };
      });
      return {
        ...section,
        totalYes: questions.reduce((sum, question) => sum + question.total, 0),
        questions,
      };
    }),
  };
}

export function applyDemographicFilters(
  data: CompanyDashboardResponse,
  departamento: string,
  puesto: string,
  search = "",
): CompanyDashboardResponse {
  let allowed = resolveDemographicAllowedIds(
    data.demographics,
    data.employees,
    departamento,
    puesto,
  );
  const term = search.trim().toLocaleLowerCase("es");
  if (term) {
    allowed = new Set(data.employees.filter(employee =>
      (!allowed || allowed.has(employee.studentId)) &&
      (employee.employeeName.toLocaleLowerCase("es").includes(term) || employee.studentId.toLowerCase().includes(term))
    ).map(employee => employee.studentId));
  }
  if (!allowed) return data;

  const employees = data.employees.filter((employee) => allowed.has(employee.studentId));
  const evaluated = employees.filter((employee) => {
    const cell = employee.forms.nom035_guia1;
    return (
      cell?.status === "completed" &&
      typeof cell.result?.requiresClinicalAssessment === "boolean"
    );
  }).length;

  return {
    ...data,
    employees,
    demographics: data.demographics ? {
      ...data.demographics,
      total: employees.length,
      completed: employees.filter(e => e.forms.nom035_guia5?.status === "completed").length,
      partial: employees.filter(e => e.forms.nom035_guia5?.status === "partial").length,
      fields: data.demographics.fields.map(field => {
        const groups = field.groups.map(group => {
          const members = employees.filter(e => group.studentIds?.includes(e.studentId));
          const risks = { ...group.risks };
          for (const guide of ["nom035_guia2", "nom035_guia3"] as const) {
            if (!risks[guide]) continue;
            const counts = { nulo: 0, bajo: 0, medio: 0, alto: 0, muy_alto: 0, sin_resultado: 0 };
            for (const employee of members) {
              const cell = employee.forms[guide];
              const level = cell?.status === "completed" ? cell.result?.level ?? "sin_resultado" : "sin_resultado";
              counts[level]++;
            }
            risks[guide] = counts;
          }
          return { ...group, count: members.length, studentIds: members.map(e => e.studentId), risks };
        }).filter(group => group.count > 0);
        return { ...field, groups, answered: groups.reduce((sum, group) => sum + group.count, 0) };
      }),
    } : undefined,
    guide1ResponseSummary: filterGuide1ResponseSummary(
      data.guide1ResponseSummary,
      allowed,
      evaluated,
    ),
  };
}
