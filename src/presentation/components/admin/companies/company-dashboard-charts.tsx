"use client";

import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL, type CompanyDashboardResponse, type DashboardFormResult, type RiskLevel } from "@/core/domain/forms/types";

const LEVELS: RiskLevel[] = ["nulo", "bajo", "medio", "alto", "muy_alto"];
const GUIDES = [{ key: "nom035_guia2", label: "Guía II" }, { key: "nom035_guia3", label: "Guía III" }] as const;
const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const pct = (n: number, total: number) => total ? n / total * 100 : 0;

type Group = { key: string; name: string; sum: number; count: number; high: number; levels: Record<RiskLevel, number> };
function aggregate(results: DashboardFormResult[], field: "categories" | "domains"): Group[] {
  const groups = new Map<string, Group>();
  for (const result of results) {
    for (const item of result[field]) {
      if (!Number.isFinite(item.value)) continue;
      const group = groups.get(item.key) ?? { key: item.key, name: item.name, sum: 0, count: 0, high: 0, levels: { nulo: 0, bajo: 0, medio: 0, alto: 0, muy_alto: 0 } };
      group.sum += item.value;
      group.count++;
      if (LEVELS.includes(item.level)) group.levels[item.level]++;
      if (item.level === "alto" || item.level === "muy_alto") group.high++;
      groups.set(item.key, group);
    }
  }
  return [...groups.values()];
}

function Bars({ groups }: { groups: Group[] }) {
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">{LEVELS.map(level => <span key={level} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: RISK_LEVEL_COLOR[level].background }} />{RISK_LEVEL_LABEL[level]}</span>)}</div>
    {groups.map(g => <div key={g.key}>
      <div className="mb-2 flex items-start justify-between gap-4 text-sm">
        <span className="font-medium text-brand-gray">{g.name}</span>
        <span className="shrink-0 font-semibold tabular-nums text-brand-gray">{number.format(g.sum / g.count)} <span className="text-xs font-normal text-brand-muted">pts promedio</span></span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-lg bg-brand-light" role="img" aria-label={`${g.name}: ${LEVELS.map(level => `${RISK_LEVEL_LABEL[level]} ${g.levels[level]} de ${g.count}`).join(", ")}`}>
        {LEVELS.filter(level => g.levels[level] > 0).map(level => <div key={level} className="h-full border-r border-white/60 last:border-r-0" style={{ width: `${pct(g.levels[level], g.count)}%`, background: RISK_LEVEL_COLOR[level].background }} title={`${RISK_LEVEL_LABEL[level]}: ${g.levels[level]} de ${g.count} (${number.format(pct(g.levels[level], g.count))}%)`} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">{LEVELS.filter(level => g.levels[level] > 0).map(level => <span key={level}>{RISK_LEVEL_LABEL[level]}: <strong className="font-semibold text-brand-gray">{g.levels[level]} · {number.format(pct(g.levels[level], g.count))}%</strong></span>)}</div>
    </div>)}
  </div>;
}

function Radar({ groups }: { groups: Group[] }) {
  if (groups.length < 3) return <p className="py-12 text-center text-sm text-brand-muted">Se necesitan al menos tres dominios para mostrar el radar.</p>;
  const point = (i: number, value: number) => {
    const angle = i * Math.PI * 2 / groups.length - Math.PI / 2;
    return [180 + Math.cos(angle) * 125 * value / 100, 170 + Math.sin(angle) * 125 * value / 100];
  };
  return <>
    <svg viewBox="0 0 360 340" className="mx-auto w-full max-w-sm" role="img" aria-label="Porcentaje de evaluados con riesgo alto o muy alto por dominio. Escala de cero a cien por ciento.">
      {[25, 50, 75, 100].map(value => <g key={value}>
        <polygon points={groups.map((_, i) => point(i, value).join(",")).join(" ")} fill="none" stroke="#e8e8ea" />
        <text x="185" y={170 - 125 * value / 100 + 12} fontSize="9" fill="#6b6b70">{value}%</text>
      </g>)}
      {groups.map((g, i) => { const [x, y] = point(i, 100); const [lx, ly] = point(i, 117); return <g key={g.key}><line x1="180" y1="170" x2={x} y2={y} stroke="#e8e8ea" /><text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#6b6b70">{i + 1}</text></g>; })}
      <polygon points={groups.map((g, i) => point(i, pct(g.high, g.count)).join(",")).join(" ")} fill="#2e3192" fillOpacity="0.16" stroke="#2e3192" strokeWidth="2" />
      {groups.map((g, i) => { const [x, y] = point(i, pct(g.high, g.count)); return <circle key={g.key} cx={x} cy={y} r="4" fill="#2e3192"><title>{g.name}: {number.format(pct(g.high, g.count))}% ({g.high}/{g.count})</title></circle>; })}
    </svg>
    <ol className="grid gap-x-4 gap-y-2 text-xs text-brand-muted sm:grid-cols-2">{groups.map((g, i) => <li key={g.key}><span className="font-semibold text-brand-blue">{i + 1}.</span> {g.name} <strong className="text-brand-gray">{number.format(pct(g.high, g.count))}%</strong></li>)}</ol>
  </>;
}

export function CompanyDashboardCharts({ data, guide }: { data: CompanyDashboardResponse; guide: "nom035_guia2" | "nom035_guia3" }) {
  const selected = GUIDES.find(g => g.key === guide && data.assignedFormKeys.includes(g.key));
  const results = selected ? data.employees.flatMap(e => {
    const cell = e.forms[selected.key];
    return cell?.status === "completed" && cell.result ? [cell.result] : [];
  }) : [];
  const categories = aggregate(results, "categories");
  const domains = aggregate(results, "domains");
  const totals = results.flatMap(r => r.total != null && Number.isFinite(r.total) ? [r.total] : []);
  const high = results.filter(r => r.level === "alto" || r.level === "muy_alto").length;
  const counts = LEVELS.map(level => ({ level, count: results.filter(r => r.level === level).length }));
  const classified = counts.reduce((sum, c) => sum + c.count, 0);
  const average = totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : null;
  // Referencia visual del promedio; no sustituye los resultados individuales.
  const cutoffs = guide === "nom035_guia2" ? [20, 45, 70, 90] : [50, 75, 99, 140];
  const averageLevel = average == null ? null : LEVELS[cutoffs.filter(cutoff => average >= cutoff).length];
  const highCount = results.filter(r => r.level === "alto").length;
  const veryHighCount = results.filter(r => r.level === "muy_alto").length;
  const cards = [
    { label: "Evaluaciones completas", value: selected ? `${results.length} / ${data.employees.length}` : "—", note: selected ? `${number.format(pct(results.length, data.employees.length))}% de los empleados · ${selected.label}` : "Sin Guía II o III asignada" },
    { label: "Puntaje promedio", value: average == null ? "—" : number.format(average), note: "Referencia del promedio; no sustituye el riesgo individual" },
    { label: "Riesgo alto y muy alto", value: results.length ? `${number.format(pct(high, results.length))}%` : "—", note: `${high} de ${results.length} evaluados` },
    { label: "Sin evaluación completa", value: selected ? data.employees.length - results.length : "—", note: "Empleados no incluidos en los gráficos" },
  ];
  return <section className="space-y-6" aria-label="Gráficos de resultados NOM-035">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Bienestar en tu empresa</p><h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">Riesgo psicosocial · {guide === "nom035_guia2" ? "Guía II" : "Guía III"}</h2><p className="mt-2 max-w-2xl text-sm text-brand-muted">Resultados de la última asignación por empleado y guía. Solo se incluyen evaluaciones completas.</p></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((c, i) => {
      const accent = i === 1 && averageLevel ? RISK_LEVEL_COLOR[averageLevel].background : i === 2 && high > 0 ? `linear-gradient(90deg, ${RISK_LEVEL_COLOR.alto.background}, ${RISK_LEVEL_COLOR.muy_alto.background})` : i === 0 ? "#475569" : "#cbd5e1";
      return <div key={c.label} className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden="true" />
        <p className="text-xs font-semibold text-brand-muted">{c.label}</p>
        <p className="mt-3 text-3xl font-bold tabular-nums text-brand-gray">{c.value}</p>
        <p className="mt-2 text-xs leading-relaxed text-brand-muted">{c.note}</p>
        {i === 1 && averageLevel && <div className="mt-3"><span className="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold" style={RISK_LEVEL_COLOR[averageLevel]}>Rango del promedio: {RISK_LEVEL_LABEL[averageLevel]}</span></div>}
        {i === 2 && results.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md px-2.5 py-1 text-xs font-semibold" style={RISK_LEVEL_COLOR.alto}>Alto: {highCount}</span>
          <span className="rounded-md px-2.5 py-1 text-xs font-semibold" style={RISK_LEVEL_COLOR.muy_alto}>Muy alto: {veryHighCount}</span>
        </div>}
        {i === 0 && selected && <div className="mt-auto pt-4"><div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-slate-500" style={{ width: `${pct(results.length, data.employees.length)}%` }} /></div></div>}
      </div>;
    })}</div>
    {!results.length ? <div className="rounded-2xl border border-dashed border-brand-line bg-white px-6 py-12 text-center"><h3 className="font-semibold text-brand-gray">{selected ? "Aún no hay resultados completos" : "Sin guía de riesgo psicosocial asignada"}</h3><p className="mt-2 text-sm text-brand-muted">{selected ? `Los gráficos de ${selected.label} aparecerán cuando se completen los cuestionarios.` : "Los gráficos por categoría y dominio estarán disponibles al asignar y completar la Guía II o III."}</p></div> : <>
      <div className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold text-brand-gray">Distribución del nivel de riesgo</h3><p className="mt-1 text-xs text-brand-muted">{classified} resultados clasificados · {selected?.label}</p><div className="mt-5 flex h-4 overflow-hidden rounded-full bg-brand-light" aria-hidden="true">{counts.map(c => <div key={c.level} style={{ width: `${pct(c.count, classified)}%`, background: RISK_LEVEL_COLOR[c.level].background }} />)}</div><div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">{counts.map(c => <div key={c.level}><div className="flex items-center gap-2 text-xs text-brand-muted"><span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: RISK_LEVEL_COLOR[c.level].background }} />{RISK_LEVEL_LABEL[c.level]}</div><p className="mt-1 text-lg font-bold text-brand-gray">{c.count} <span className="text-xs font-normal text-brand-muted">· {number.format(pct(c.count, classified))}%</span></p></div>)}</div></div>
      <div className="grid items-start gap-6 xl:grid-cols-2"><div className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold text-brand-gray">Nivel de riesgo por categoría</h3><p className="mb-6 mt-1 text-xs text-brand-muted">Distribución de empleados por nivel de riesgo. Cada barra representa el 100% de sus evaluados.</p>{categories.length ? <Bars groups={categories} /> : <p className="text-sm text-brand-muted">Sin detalle de categorías disponible.</p>}</div><div className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold text-brand-gray">Perfil de riesgo por dominio</h3><p className="mt-1 text-xs text-brand-muted">Porcentaje con riesgo alto o muy alto · escala común de 0 a 100%.</p><Radar groups={domains} /></div></div>
      <div className="rounded-2xl border border-brand-line bg-white p-6"><h3 className="font-display font-bold text-brand-gray">Nivel de riesgo por dominio</h3><p className="mb-6 mt-1 text-xs text-brand-muted">Colores según el nivel calculado de cada empleado en el dominio. El puntaje promedio se muestra por separado.</p>{domains.length ? <Bars groups={domains} /> : <p className="text-sm text-brand-muted">Sin detalle de dominios disponible.</p>}</div>
    </>}
  </section>;
}
