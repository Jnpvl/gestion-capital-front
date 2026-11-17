import { CompanyDashboardGuide1Responses } from "./company-dashboard-guide1-responses";
import { EmployeePeopleCard } from "./employee-people-card";
import { EmployeeRiskBar } from "./employee-risk-bar";
import {
  CLINICAL_RESULT_COLOR,
  clinicalResultText,
  type CompanyDashboardResponse,
} from "@/core/domain/forms/types";

const format = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });

export function CompanyDashboardClinical({ data, readOnly = false, returnTo, onOpenReferrals }: { data: CompanyDashboardResponse; readOnly?: boolean; returnTo: string; onOpenReferrals: () => void }) {
  const assigned = data.assignedFormKeys.includes("nom035_guia1");
  const evaluated = assigned ? data.employees.flatMap(employee => {
    const cell = employee.forms.nom035_guia1;
    const requires = cell?.result?.requiresClinicalAssessment;
    return cell?.status === "completed" && typeof requires === "boolean"
      ? [{ id: employee.studentId, name: employee.employeeName, requires, event: cell.result?.traumaticEventReported }]
      : [];
  }) : [];
  const requiresPeople = evaluated.filter(e => e.requires).map(e => ({ studentId: e.id, name: e.name }));
  const notRequiresPeople = evaluated.filter(e => !e.requires).map(e => ({ studentId: e.id, name: e.name }));
  const evaluatedPeople = evaluated.map(e => ({ studentId: e.id, name: e.name }));
  const pendingPeople = assigned
    ? data.employees
        .filter((employee) => {
          const cell = employee.forms.nom035_guia1;
          return !(cell?.status === "completed" && typeof cell.result?.requiresClinicalAssessment === "boolean");
        })
        .map((employee) => ({ studentId: employee.studentId, name: employee.employeeName }))
    : [];
  const reportedPeople = evaluated.filter(e => e.event === true).map(e => ({ studentId: e.id, name: e.name }));
  const withoutEventPeople = evaluated.filter(e => e.event === false).map(e => ({ studentId: e.id, name: e.name }));
  const requires = requiresPeople.length;
  const reported = reportedPeople.length;
  const eventsKnown = evaluated.every(e => typeof e.event === "boolean");
  const percent = (count: number, total: number) => total ? count / total * 100 : 0;
  const requiresLabel = clinicalResultText(true);
  const notRequiresLabel = clinicalResultText(false);
  const groups = [
    {
      label: requiresLabel,
      count: requires,
      color: CLINICAL_RESULT_COLOR.requires.background,
    },
    {
      label: notRequiresLabel,
      count: evaluated.length - requires,
      color: CLINICAL_RESULT_COLOR.none.background,
    },
  ];
  const cards = [
    {
      label: "Participantes",
      value: assigned ? `${evaluated.length} / ${data.employees.length}` : "—",
      note: `${format.format(percent(evaluated.length, data.employees.length))}% de los empleados`,
      people: evaluatedPeople,
      accent: true,
    },
    {
      label: requiresLabel,
      value: evaluated.length ? requires : "—",
      note: evaluated.length ? `${format.format(percent(requires, evaluated.length))}% de los evaluados` : "Sin resultados disponibles",
      people: requiresPeople,
    },
    {
      label: notRequiresLabel,
      value: evaluated.length ? evaluated.length - requires : "—",
      note: evaluated.length ? `${format.format(percent(evaluated.length - requires, evaluated.length))}% de los evaluados` : "Sin resultados disponibles",
      people: notRequiresPeople,
    },
    {
      label: "Acontecimiento traumático severo",
      value: evaluated.length && eventsKnown ? reported : "—",
      note: "Al menos un Sí en la sección I",
      people: eventsKnown ? reportedPeople : [],
    },

  ];

  return <section className="space-y-6" aria-label="Resultados de Guía I">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Guía I · {data.evaluationYear}</p><h2 className="mt-1 font-display text-2xl font-bold text-brand-gray">Guía de Referencia I · Resultado</h2></div>
    <div className="space-y-4">
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.slice(0, 4).map((card, index) => (
          <EmployeePeopleCard
            key={card.label}
            label={card.label}
            value={card.value}
            note={assigned ? card.note : "Guía I sin asignar"}
            people={card.people}
            readOnly={readOnly}
            returnTo={returnTo}
            guideLabel="Guía I"
            exportYear={data.evaluationYear}
            accent={card.accent}
            valueColor={index === 1 ? CLINICAL_RESULT_COLOR.requires.background : index === 2 ? CLINICAL_RESULT_COLOR.none.background : undefined}
            secondary={index === 0 ? { label: "Sin resultados disponibles", people: pendingPeople } : index === 3 && eventsKnown ? { label: "Sin acontecimiento traumático severo", people: withoutEventPeople } : undefined}
          />
        ))}
      </div>
      <EmployeePeopleCard
        label="Seguimiento de canalización"
        value={assigned ? requiresPeople.length : "—"}
        note="Personas que requieren valoración clínica"
        people={requiresPeople}
        readOnly={readOnly}
        returnTo={returnTo}
        guideLabel="Guía I"
        exportYear={data.evaluationYear}
        onActivate={onOpenReferrals}
      />
    </div>
    <div className="grid items-stretch gap-6">
      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <h3 className="font-display font-bold text-brand-gray">Distribución de resultados</h3>
        <p className="mt-2 text-sm text-brand-muted">Distribución de resultados de Guía I · sobre {evaluated.length} evaluaciones completas.</p>
        {evaluated.length ? <>
          <div className="mt-6"><EmployeeRiskBar label="Resultado GR.I" readOnly={readOnly} returnTo={returnTo}
            segments={[
              { key: "requires", label: requiresLabel, color: CLINICAL_RESULT_COLOR.requires.background, count: requires,
                people: requiresPeople },
              { key: "none", label: notRequiresLabel, color: CLINICAL_RESULT_COLOR.none.background, count: evaluated.length - requires,
                people: notRequiresPeople },
            ]} /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {groups.map(group =>
              <div key={group.label}><p className="text-sm text-brand-muted"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: group.color }} />{group.label}</p>
                <p className="mt-2 text-2xl font-bold text-brand-gray">{group.count} <span className="text-sm font-normal text-brand-muted">· {format.format(percent(group.count, evaluated.length))}%</span></p></div>)}
          </div>
        </> : <p className="flex min-h-40 items-center justify-center text-sm text-brand-muted">{assigned ? "Sin resultados disponibles para esta distribución." : "Guía I no asignada en este año."}</p>}
      </div>
    </div>

    <CompanyDashboardGuide1Responses
      summary={data.guide1ResponseSummary}
      assigned={assigned}
      readOnly={readOnly}
      returnTo={returnTo}
    />
  </section>;
}
