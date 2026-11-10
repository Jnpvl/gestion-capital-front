"use client";

import { useEffect, useMemo, useState } from "react";
import { EmployeeRiskBar, type RiskBarPerson } from "./employee-risk-bar";
import { DashboardEmployeeLink } from "./dashboard-employee-link";
import { EmployeePeopleCard } from "./employee-people-card";
import {
  ScoringScopeTrigger,
  type ScoringScope,
} from "./scoring-scope-trigger";
import {
  RISK_LEVEL_COLOR,
  RISK_LEVEL_LABEL,
  type CompanyDashboardResponse,
  type DashboardFormResult,
  type FormDefinition,
  type RiskLevel,
} from "@/core/domain/forms/types";
import { getForm } from "@/infrastructure/http/forms-api";
import { getPortalForm } from "@/infrastructure/http/company-portal-api";

const LEVELS: RiskLevel[] = ["nulo", "bajo", "medio", "alto", "muy_alto"];
const GUIDES = [{ key: "nom035_guia2", label: "Guía II" }, { key: "nom035_guia3", label: "Guía III" }] as const;
const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const pct = (n: number, total: number) => total ? n / total * 100 : 0;

/**
 * Cutoffs Guía III (DOF) para C_cat y C_dom.
 * Usados en la barra de puntaje promedio (mismo criterio que Guía II).
 */
const GUIA3_CUTOFFS: Record<string, number[]> = {
  ambiente: [5, 9, 11, 14],
  actividad: [15, 30, 45, 60],
  tiempo: [5, 7, 10, 13],
  liderazgo_relaciones: [14, 29, 42, 58],
  entorno: [10, 14, 18, 23],
  condiciones_ambiente: [5, 9, 11, 14],
  carga: [15, 21, 27, 37],
  falta_control: [11, 16, 21, 25],
  jornada: [1, 2, 4, 6],
  interferencia: [4, 6, 8, 10],
  liderazgo: [9, 12, 16, 20],
  relaciones: [10, 13, 17, 21],
  violencia: [7, 10, 13, 16],
  reconocimiento: [6, 10, 14, 18],
  pertenencia: [4, 6, 8, 10],
};

type Group = {
  key: string;
  name: string;
  sum: number;
  count: number;
  high: number;
  levels: Record<RiskLevel, number>;
  people: Record<RiskLevel, RiskBarPerson[]>;
};

function emptyGroup(key: string, name: string): Group {
  return {
    key,
    name,
    sum: 0,
    count: 0,
    high: 0,
    people: { nulo: [], bajo: [], medio: [], alto: [], muy_alto: [] },
    levels: { nulo: 0, bajo: 0, medio: 0, alto: 0, muy_alto: 0 },
  };
}

function aggregate(results: (DashboardFormResult & RiskBarPerson)[], field: "categories" | "domains"): Group[] {
  const groups = new Map<string, Group>();
  for (const result of results) {
    for (const item of result[field]) {
      if (!Number.isFinite(item.value)) continue;
      const group = groups.get(item.key) ?? emptyGroup(item.key, item.name);
      group.sum += item.value;
      group.count++;
      if (LEVELS.includes(item.level)) {
        group.levels[item.level]++;
        group.people[item.level].push({ studentId: result.studentId, name: result.name });
      }
      if (item.level === "alto" || item.level === "muy_alto") group.high++;
      groups.set(item.key, group);
    }
  }
  return [...groups.values()];
}

function riskLevelFrom(value: number, cutoffs: number[]): RiskLevel {
  let i = 0;
  while (i < cutoffs.length && value >= cutoffs[i]) i += 1;
  return LEVELS[i];
}

/** Rangos de la tabla NOM (C_cat / C_dom): nulo | bajo | medio | alto | muy alto. */
function cutoffRangeLabel(cutoffs: number[], level: RiskLevel): string {
  const [c0, c1, c2, c3] = cutoffs;
  switch (level) {
    case "nulo":
      return `< ${number.format(c0)}`;
    case "bajo":
      return `${number.format(c0)} ≤ C < ${number.format(c1)}`;
    case "medio":
      return `${number.format(c1)} ≤ C < ${number.format(c2)}`;
    case "alto":
      return `${number.format(c2)} ≤ C < ${number.format(c3)}`;
    case "muy_alto":
      return `C ≥ ${number.format(c3)}`;
  }
}

/**
 * Color según tablas NOM (C_cat / C_dom) con el promedio por persona.
 * Misma tabla que antes; C = sumatoria / evaluados.
 */
function TotalPointsBar({
  label,
  sum,
  count,
  cutoffs,
}: {
  label: string;
  sum: number;
  count: number;
  cutoffs: number[];
}) {
  const average = count > 0 ? sum / count : 0;
  const level = riskLevelFrom(average, cutoffs);
  const color = RISK_LEVEL_COLOR[level];
  return (
    <div>
      <div
        className="h-6 overflow-hidden rounded-lg"
        role="img"
        aria-label={`${label}: C=${number.format(average)} · ${RISK_LEVEL_LABEL[level]}`}
        style={{ background: color.background }}
      />
      <p className="mt-2 text-xs text-brand-muted">
        <span
          className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-black/10"
          style={{ background: color.background }}
        />
        Según tabla NOM:{" "}
        <strong className="text-brand-gray">
          C = {number.format(average)} → {RISK_LEVEL_LABEL[level]}
        </strong>{" "}
        <span className="tabular-nums">({cutoffRangeLabel(cutoffs, level)})</span>
      </p>
    </div>
  );
}

function buildScopes(form: FormDefinition | null): { categories: Map<string, ScoringScope>; domains: Map<string, ScoringScope> } {
  const categories = new Map<string, ScoringScope>();
  const domains = new Map<string, ScoringScope>();
  if (!form?.scoring) return { categories, domains };

  const questionByNumber = new Map<number, string>();
  for (const section of form.sections) {
    for (const question of section.questions) {
      if (question.number != null) {
        questionByNumber.set(question.number, question.resultQuestion ?? question.text);
      }
    }
  }

  for (const category of form.scoring.categories) {
    const categoryItems: ScoringScope["items"] = [];
    for (const domain of category.domains) {
      const domainItems: ScoringScope["items"] = [];
      for (const dimension of domain.dimensions) {
        for (const itemNumber of dimension.items) {
          const item = {
            number: itemNumber,
            text: questionByNumber.get(itemNumber) ?? `Ítem ${itemNumber}`,
            dimension: dimension.name,
            domainName: domain.name,
          };
          domainItems.push(item);
          categoryItems.push(item);
        }
      }
      domains.set(domain.key, {
        kind: "domain",
        name: domain.name,
        cutoffs: [...domain.cutoffs],
        items: domainItems,
      });
    }
    categories.set(category.key, {
      kind: "category",
      name: category.name,
      cutoffs: [...category.cutoffs],
      items: categoryItems,
    });
  }
  return { categories, domains };
}

function Bars({
  groups,
  scopes,
  guide,
  readOnly,
  returnTo,
  showPeopleDistribution = false,
}: {
  groups: Group[];
  scopes: Map<string, ScoringScope>;
  guide: "nom035_guia2" | "nom035_guia3";
  readOnly: boolean;
  returnTo: string;
  /** Destaca cuántos empleados quedaron en cada nivel (además del promedio). */
  showPeopleDistribution?: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">
        {LEVELS.map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/10"
              style={{ background: RISK_LEVEL_COLOR[level].background }}
            />
            {RISK_LEVEL_LABEL[level]}
          </span>
        ))}
      </div>
      <p className="text-xs text-brand-muted">
        Pasa el cursor o haz clic en el nombre para ver las preguntas contempladas en el cálculo.
        {showPeopleDistribution
          ? " El color de la primera barra sigue la tabla NOM con el promedio; la segunda cuenta empleados por nivel."
          : null}
      </p>
      {groups.map((g) => {
        const scope = scopes.get(g.key);
        const cutoffs =
          scope?.cutoffs ??
          (guide === "nom035_guia3" ? GUIA3_CUTOFFS[g.key] : undefined);
        const average = g.count > 0 ? g.sum / g.count : 0;
        const segments = LEVELS.map((level) => ({
          key: level,
          label: RISK_LEVEL_LABEL[level],
          color: RISK_LEVEL_COLOR[level].background,
          count: g.levels[level],
          people: g.people[level],
        }));
        return (
          <div key={g.key} className="space-y-4">
            <div className="flex items-start justify-between gap-4 text-sm">
              {scope ? (
                <ScoringScopeTrigger scope={scope} />
              ) : (
                <span className="font-medium text-brand-gray">{g.name}</span>
              )}
              <span className="shrink-0 text-right">
                <span className="block font-semibold tabular-nums text-brand-gray">
                  {number.format(average)}{" "}
                  <span className="text-xs font-normal text-brand-muted">pts promedio</span>
                </span>
                {showPeopleDistribution ? (
                  <span className="mt-0.5 block text-[11px] text-brand-muted">
                    {g.count} evaluados
                  </span>
                ) : null}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-brand-muted">Puntaje promedio</p>
              {cutoffs ? (
                <TotalPointsBar
                  label={g.name}
                  sum={g.sum}
                  count={g.count}
                  cutoffs={cutoffs}
                />
              ) : (
                <div className="h-6 rounded-lg bg-brand-light" aria-hidden="true" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-brand-muted">
                Distribución de empleados por nivel
              </p>
              <EmployeeRiskBar
                label={g.name}
                readOnly={readOnly}
                returnTo={returnTo}
                segments={segments}
              />
            </div>

            {showPeopleDistribution ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {LEVELS.map((level) => {
                  const count = g.levels[level];
                  return (
                    <div
                      key={level}
                      className="rounded-lg border border-brand-line bg-brand-light/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border border-black/10"
                          style={{ background: RISK_LEVEL_COLOR[level].background }}
                        />
                        <span className="truncate">{RISK_LEVEL_LABEL[level]}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold tabular-nums text-brand-gray">
                        {count}{" "}
                        <span className="text-[11px] font-normal text-brand-muted">
                          · {number.format(pct(count, g.count))}%
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Radar({ groups }: { groups: Group[] }) {
  if (groups.length < 3) {
    return (
      <p className="py-12 text-center text-sm text-brand-muted">
        Se necesitan al menos tres dominios para mostrar el radar.
      </p>
    );
  }
  const point = (i: number, value: number) => {
    const angle = (i * Math.PI * 2) / groups.length - Math.PI / 2;
    return [180 + (Math.cos(angle) * 125 * value) / 100, 170 + (Math.sin(angle) * 125 * value) / 100];
  };
  const ranked = [...groups].sort((a, b) => pct(b.high, b.count) - pct(a.high, a.count));
  return (
    <div className="mt-4 flex flex-col gap-6">
      <svg
        viewBox="0 0 360 340"
        className="mx-auto w-full max-w-[22rem]"
        role="img"
        aria-label="Porcentaje de evaluados con riesgo alto o muy alto por dominio. Escala de cero a cien por ciento."
      >
        {[25, 50, 75, 100].map((value) => (
          <g key={value}>
            <polygon
              points={groups.map((_, i) => point(i, value).join(",")).join(" ")}
              fill="none"
              stroke="#e8e8ea"
            />
            <text x="185" y={170 - (125 * value) / 100 + 12} fontSize="9" fill="#6b6b70">
              {value}%
            </text>
          </g>
        ))}
        {groups.map((g, i) => {
          const [x, y] = point(i, 100);
          const [lx, ly] = point(i, 117);
          return (
            <g key={g.key}>
              <line x1="180" y1="170" x2={x} y2={y} stroke="#e8e8ea" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#6b6b70"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        <polygon
          points={groups.map((g, i) => point(i, pct(g.high, g.count)).join(",")).join(" ")}
          fill="#2e3192"
          fillOpacity="0.16"
          stroke="#2e3192"
          strokeWidth="2"
        />
        {groups.map((g, i) => {
          const [x, y] = point(i, pct(g.high, g.count));
          return (
            <circle key={g.key} cx={x} cy={y} r="4" fill="#2e3192">
              <title>
                {g.name}: {number.format(pct(g.high, g.count))}% ({g.high}/{g.count})
              </title>
            </circle>
          );
        })}
      </svg>
      <ol className="space-y-2.5 border-t border-brand-line pt-4">
        {groups.map((g, i) => {
          const share = pct(g.high, g.count);
          return (
            <li key={g.key} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 text-brand-muted">
                <span className="font-semibold text-brand-blue">{i + 1}.</span> {g.name}
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-brand-gray">
                {number.format(share)}%
                <span className="ml-1 text-xs font-normal text-brand-muted">
                  ({g.high}/{g.count})
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {ranked[0] ? (
        <p className="rounded-xl bg-brand-light px-3 py-2 text-xs text-brand-muted">
          Mayor concentración alto/muy alto:{" "}
          <strong className="text-brand-gray">{ranked[0].name}</strong> ·{" "}
          {number.format(pct(ranked[0].high, ranked[0].count))}%
        </p>
      ) : null}
    </div>
  );
}

export function CompanyDashboardCharts({ data, guide, readOnly, returnTo }: { data: CompanyDashboardResponse; guide: "nom035_guia2" | "nom035_guia3"; readOnly: boolean; returnTo: string }) {
  const guideLabel = guide === "nom035_guia2" ? "Guía II" : "Guía III";
  const [form, setForm] = useState<FormDefinition | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = readOnly ? getPortalForm : getForm;
    load(guide)
      .then((response) => {
        if (!cancelled) setForm(response.form);
      })
      .catch(() => {
        if (!cancelled) setForm(null);
      });
    return () => {
      cancelled = true;
    };
  }, [guide, readOnly]);
  const scopes = useMemo(() => buildScopes(form), [form]);
  const selected = GUIDES.find(g => g.key === guide && data.assignedFormKeys.includes(g.key));
  const results = selected ? data.employees.flatMap(e => {
    const cell = e.forms[selected.key];
    return cell?.status === "completed" && cell.result && (cell.result.total != null && Number.isFinite(cell.result.total) && cell.result.level != null && LEVELS.includes(cell.result.level)) ? [{ ...cell.result, studentId: e.studentId, name: e.employeeName }] : [];
  }) : [];
  const categories = aggregate(results, "categories");
  const domains = aggregate(results, "domains");
  const violenceDomain = domains.find(domain => domain.key === "violencia");
  const violencePeople = [...new Map([
    ...(violenceDomain?.people.alto ?? []),
    ...(violenceDomain?.people.muy_alto ?? []),
  ].map(person => [person.studentId, person])).values()];
  const totals = results.flatMap(r => r.total != null && Number.isFinite(r.total) ? [r.total] : []);
  const high = results.filter(r => r.level === "alto" || r.level === "muy_alto").length;
  const counts = LEVELS.map(level => ({ level, count: results.filter(r => r.level === level).length }));
  const average = totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : null;
  const cutoffs = guide === "nom035_guia2" ? [20, 45, 70, 90] : [50, 75, 99, 140];
  const averageLevel = average == null ? null : LEVELS[cutoffs.filter(cutoff => average >= cutoff).length];
  const highCount = results.filter(r => r.level === "alto").length;
  const veryHighCount = results.filter(r => r.level === "muy_alto").length;
  const globalHighPeople = results.filter(r => r.level === "alto" || r.level === "muy_alto");
  const referralCandidates = guide === "nom035_guia2"
    ? results.flatMap(person => {
        const violence = person.domains.find(domain => domain.key === "violencia");
        return violence && (violence.level === "alto" || violence.level === "muy_alto")
          ? [{ ...person, level: violence.level }] : [];
      })
    : globalHighPeople;
  // Conectar a los registros de seguimiento cuando se implemente la canalización.
  const referredPeople: RiskBarPerson[] = [];
  const pendingReferralPeople = referralCandidates.filter(person =>
    !referredPeople.some(referred => referred.studentId === person.studentId));
  const peopleByIndex: RiskBarPerson[][] = !selected ? [] : [
    results,
    results.filter((person) => person.level === "alto"),
    results.filter((person) => person.level === "muy_alto"),
    data.employees
      .filter((employee) => !results.some((person) => person.studentId === employee.studentId))
      .map((employee) => ({ studentId: employee.studentId, name: employee.employeeName })),
    globalHighPeople,
    results,
    referredPeople,
    pendingReferralPeople,
    violencePeople,
  ];
  const summaryCards = [
    { label: "Participantes", value: `${results.length} / ${data.employees.length}`, note: `${number.format(pct(results.length, data.employees.length))}% de los empleados` },
    { label: "Riesgo alto", value: highCount, note: `${number.format(pct(highCount, results.length))}% de los evaluados` },
    { label: "Riesgo muy alto", value: veryHighCount, note: `${number.format(pct(veryHighCount, results.length))}% de los evaluados` },
    { label: "Sin resultado disponible", value: data.employees.length - results.length, note: "Pendientes, parciales o sin resultado" },
    { label: "Riesgo alto y muy alto", value: high, note: `${high} de ${results.length} evaluados · ${number.format(pct(high, results.length))}%` },
    { label: "Calificacion final", value: average == null ? "—" : number.format(average), note: "Referencia del promedio; no sustituye el riesgo individual" },
    { label: "Canalizaciones realizadas", value: referredPeople.length, note: "Personas canalizadas en este año" },
    { label: "Pendientes de canalizar", value: pendingReferralPeople.length, note: guide === "nom035_guia2" ? "Dominio Violencia: alto o muy alto" : "Personas con riesgo alto o muy alto" },
    { label: "Detectados con violencia", value: violenceDomain ? violencePeople.length : "—", note: violenceDomain
      ? `Dominio Violencia · ${violencePeople.length} de ${violenceDomain.count} evaluados · ${number.format(pct(violencePeople.length, violenceDomain.count))}%`
      : "Sin resultados del dominio Violencia" },
  ]
    .map((card, index) => ({ card, index }))
    .filter(({ index }) => index !== 1 && index !== 2)
    .sort((a, b) => [0, 5, 3, 4, 8, 6, 7].indexOf(a.index) - [0, 5, 3, 4, 8, 6, 7].indexOf(b.index));
  const renderSummaryCard = ({ card, index }: (typeof summaryCards)[number]) => (
    <EmployeePeopleCard
      key={card.label}
      label={card.label}
      icon={index === 8 ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-red-600"><path d="M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Z" /><path d="M12 7v6m0 3v1" /></svg> : undefined}
      value={selected ? card.value : "—"}
      note={selected ? card.note : `${guideLabel} sin asignar`}
      accent={index === 0}
      readOnly={readOnly}
      returnTo={returnTo}
      valueColor={index === 5 && averageLevel ? RISK_LEVEL_COLOR[averageLevel].background : undefined}
      badge={index === 5 && averageLevel ? {
        label: `Nivel de riesgo: ${RISK_LEVEL_LABEL[averageLevel]}`,
        ...RISK_LEVEL_COLOR[averageLevel],
      } : undefined}
      breakdown={index === 4 && selected ? [
        { label: "Alto", value: highCount, ...RISK_LEVEL_COLOR.alto },
        { label: "Muy alto", value: veryHighCount, ...RISK_LEVEL_COLOR.muy_alto },
      ] : index === 8 && selected && violenceDomain ? [
        { label: "Alto", value: violenceDomain.levels.alto, ...RISK_LEVEL_COLOR.alto },
        { label: "Muy alto", value: violenceDomain.levels.muy_alto, ...RISK_LEVEL_COLOR.muy_alto },
      ] : undefined}
      people={peopleByIndex[index] ?? []}
    />
  );
  return <section className="space-y-6" aria-label={`Resultados de ${guideLabel}`}>
    <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">{guideLabel} · {data.evaluationYear}</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">Distribución de resultados</h2></div>
    <div className="space-y-4">
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.slice(0, 4).map(renderSummaryCard)}
      </div>
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.slice(4).map(renderSummaryCard)}
      </div>
    </div>
    <div className="grid items-stretch gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h3 className="font-display font-bold text-brand-gray">Distribución de resultados</h3>
        <p className="mt-2 text-sm text-brand-muted">
          Nivel de riesgo según el puntaje de cada formulario completo · {results.length} evaluaciones.
        </p>
        {results.length ? (
          <>
            <div className="mt-6">
              <EmployeeRiskBar
                label="Distribución de resultados"
                readOnly={readOnly}
                returnTo={returnTo}
                segments={counts.map(({ level, count }) => ({
                  key: level,
                  label: RISK_LEVEL_LABEL[level],
                  color: RISK_LEVEL_COLOR[level].background,
                  count,
                  people: results.filter((person) => person.level === level),
                }))}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {counts.map(({ level, count }) => (
                <div key={level}>
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ background: RISK_LEVEL_COLOR[level].background }}
                    />
                    {RISK_LEVEL_LABEL[level]}
                  </div>
                  <p className="mt-1 text-lg font-bold text-brand-gray">
                    {count}{" "}
                    <span className="text-xs font-normal text-brand-muted">
                      · {number.format(pct(count, results.length))}%
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
              <div>
                <p className="text-xs text-brand-muted">Calificacion final</p>
                <p
                  className="mt-1 text-2xl font-bold tabular-nums"
                  style={{ color: averageLevel ? RISK_LEVEL_COLOR[averageLevel].background : undefined }}
                >
                  {average == null ? "—" : number.format(average)}
                </p>
              </div>
              {averageLevel ? (
                <span
                  className="rounded-lg px-3 py-1 text-xs font-semibold"
                  style={RISK_LEVEL_COLOR[averageLevel]}
                >
                  Nivel de riesgo: {RISK_LEVEL_LABEL[averageLevel]}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <p className="flex min-h-40 items-center justify-center text-sm text-brand-muted">
            {selected
              ? "Sin evaluaciones completas en este año."
              : `${guideLabel} no asignada en este año.`}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h3 className="font-display font-bold text-brand-gray">Seguimiento de canalización</h3>
        <p className="mt-2 text-sm text-brand-muted">
          {guide === "nom035_guia2"
            ? "Personas con nivel alto o muy alto en el dominio Violencia."
            : "Personas con riesgo alto o muy alto · revisión para decidir canalización."}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: guide === "nom035_guia2" ? "Detectados con violencia" : "Total alto y muy alto",
              value: referralCandidates.length,
              style: "bg-slate-50 text-slate-700",
            },
            { label: "Canalizadas", value: referredPeople.length, style: "bg-green-50 text-green-700" },
            {
              label: "Pendientes de canalizar",
              value: pendingReferralPeople.length,
              style: "bg-amber-50 text-amber-700",
            },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-4 ${item.style}`}>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{selected ? item.value : "—"}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <EmployeeRiskBar
            label={`Seguimiento de canalización · ${guideLabel}`}
            readOnly={readOnly}
            returnTo={returnTo}
            segments={[
              {
                key: "referred",
                label: "Canalizadas",
                color: "#16a34a",
                count: referredPeople.length,
                people: referredPeople,
              },
              {
                key: "pending",
                label: "Pendientes de canalizar",
                color: "#d97706",
                count: pendingReferralPeople.length,
                people: pendingReferralPeople,
              },
            ]}
          />
        </div>
        {referralCandidates.length > 0 && (
          <p className="mt-3 text-sm font-medium text-brand-muted">
            {number.format(pct(referredPeople.length, referralCandidates.length))}% de avance
          </p>
        )}
        {referralCandidates.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-brand-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-light text-brand-muted">
                <tr>
                  {[
                    "Empleado",
                    guide === "nom035_guia2" ? "Nivel en Violencia" : "Nivel de riesgo",
                    "Estado",
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {referralCandidates.map((person) => {
                  const referred = referredPeople.some((item) => item.studentId === person.studentId);
                  return (
                    <tr key={person.studentId}>
                      <td className="px-4 py-4">
                        <DashboardEmployeeLink
                          studentId={person.studentId}
                          name={person.name}
                          readOnly={readOnly}
                          returnTo={returnTo}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="rounded-lg px-3 py-1 text-xs font-semibold"
                          style={RISK_LEVEL_COLOR[person.level!]}
                        >
                          {RISK_LEVEL_LABEL[person.level!]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold ${
                            referred ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {referred ? "Canalización realizada" : "Pendiente de canalizar"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!referralCandidates.length && (
          <p className="mt-4 text-sm text-brand-muted">
            {results.length
              ? guide === "nom035_guia2"
                ? "Sin personas con nivel alto o muy alto en Violencia."
                : "Sin personas pendientes de revisión por riesgo alto o muy alto."
              : "Sin resultados disponibles en este año."}
          </p>
        )}
      </div>
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h3 className="font-display font-bold text-brand-gray">Nivel de riesgo por categoría</h3>
        <p className="mb-6 mt-1 text-xs text-brand-muted">
          Promedio del puntaje de la categoría (tabla NOM), y distribución de empleados por nivel.
        </p>
        {categories.length ? (
          <Bars
            groups={categories}
            scopes={scopes.categories}
            guide={guide}
            readOnly={readOnly}
            returnTo={returnTo}
            showPeopleDistribution
          />
        ) : (
          <p className="text-sm text-brand-muted">Sin detalle de categorías disponible.</p>
        )}
      </div>
      <div className="rounded-2xl border border-brand-line bg-white p-6 xl:sticky xl:top-6">
        <h3 className="font-display font-bold text-brand-gray">Perfil de riesgo por dominio</h3>
        <p className="mt-1 text-xs text-brand-muted">
          Porcentaje de evaluados con riesgo alto o muy alto en cada dominio (escala 0 a 100%).
        </p>
        <Radar groups={domains} />
      </div>
    </div>
    <div className="rounded-2xl border border-brand-line bg-white p-6">
      <h3 className="font-display font-bold text-brand-gray">Nivel de riesgo por dominio</h3>
      <p className="mb-6 mt-1 text-xs text-brand-muted">
        Promedio del dominio (tabla NOM) y distribución de empleados por nivel.
      </p>
      {domains.length ? (
        <Bars
          groups={domains}
          scopes={scopes.domains}
          guide={guide}
          readOnly={readOnly}
          returnTo={returnTo}
        />
      ) : (
        <p className="text-sm text-brand-muted">Sin detalle de dominios disponible.</p>
      )}
    </div>
  </section>;
}
