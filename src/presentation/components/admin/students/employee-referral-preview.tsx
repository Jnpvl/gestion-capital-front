"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { CompanyDashboardResponse, DashboardEmployee, FormKey } from "@/core/domain/forms/types";
import type { CompanyPsychologist } from "@/core/domain/referrals/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  CompaniesApiError,
  createCompanyPsychologist,
  deleteCompanyPsychologist,
  getCompanyEmployeeReferral,
  saveCompanyEmployeeReferral,
  updateCompanyPsychologist,
} from "@/infrastructure/http/companies-api";
import {
  CompanyPortalApiError,
  createPortalPsychologist,
  deletePortalPsychologist,
  getPortalEmployeeReferral,
  savePortalEmployeeReferral,
  updatePortalPsychologist,
} from "@/infrastructure/http/company-portal-api";
import { showError, showSuccess, showWarning } from "@/shared/lib/alerts";
import { getReferralReasons } from "@/shared/lib/referral-reasons";

const input =
  "w-full min-w-0 rounded-lg border border-brand-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-xs font-semibold text-brand-muted">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-brand-line bg-white p-4 sm:p-6">
      <div className="mb-5">
        <h3 className="font-display text-lg font-bold text-brand-gray">{title}</h3>
        {description ? <p className="mt-1.5 text-sm text-brand-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const STEPS = ["Expediente", "Psicólogo", "Sesiones", "Cierre"] as const;
const STEP_META: Record<
  (typeof STEPS)[number],
  { label: string; hint: string }
> = {
  Expediente: {
    label: "1. Motivo",
    hint: "Por qué se canaliza",
  },
  Psicólogo: {
    label: "2. Psicólogo",
    hint: "Quién atiende",
  },
  Sesiones: {
    label: "3. Sesiones",
    hint: "Citas y notas",
  },
  Cierre: {
    label: "4. Cierre",
    hint: "Conclusión del caso",
  },
};
const SESSION_STATUSES = ["Programada", "Realizada", "Cancelada"] as const;
const CLOSURE_RESOLUTIONS = ["Alta", "Seguimiento"] as const;

const STATUS_STYLE: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-900",
  Canalizado: "bg-sky-50 text-sky-900",
  "En atención": "bg-sky-50 text-sky-900",
  Alta: "bg-emerald-50 text-emerald-900",
  Seguimiento: "bg-violet-50 text-violet-900",
};

const STATUS_HELP: Record<string, string> = {
  Pendiente: "Aún no hay seguimiento registrado",
  Canalizado: "Ya hay psicólogo asignado",
  "En atención": "Hay sesiones en curso",
  Alta: "Caso cerrado con alta",
  Seguimiento: "Caso cerrado con seguimiento",
};

const GUIDE_BLURB: Partial<Record<FormKey, string>> = {
  nom035_guia1: "Acontecimientos traumáticos severos",
  nom035_guia2: "Factores de riesgo psicosocial",
  nom035_guia3: "Entorno organizacional",
};

type SessionForm = {
  localId: string;
  psychologistId: string;
  datetime: string;
  status: (typeof SESSION_STATUSES)[number];
  notes: string;
  saved: boolean;
};

type ClosureForm = {
  psychologistId: string;
  conclusion: string;
  recommendations: string;
  resolution: "" | (typeof CLOSURE_RESOLUTIONS)[number];
};

const emptyDraft = { name: "", license: "", phone: "", email: "", address: "" };
const emptyClosure: ClosureForm = {
  psychologistId: "",
  conclusion: "",
  recommendations: "",
  resolution: "",
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isSessionEmpty(session: SessionForm) {
  return (
    !session.psychologistId &&
    !session.datetime.trim() &&
    !session.notes.trim() &&
    session.status === "Programada" &&
    !session.saved
  );
}

function psychologistLabel(psychologist: CompanyPsychologist) {
  return `${psychologist.name}${psychologist.license ? ` · Cédula ${psychologist.license}` : ""}`;
}

function apiMessage(error: unknown, fallback: string) {
  if (error instanceof CompaniesApiError || error instanceof CompanyPortalApiError) return error.message;
  return error instanceof Error ? error.message : fallback;
}

export function EmployeeReferralPreview({
  companyId,
  studentId,
  employee,
  data,
  name,
  year,
  portal = false,
  onViewAnswers,
}: {
  companyId: string;
  studentId: string;
  employee?: DashboardEmployee;
  data?: Pick<CompanyDashboardResponse, "assignedFormKeys" | "sampling"> | null;
  name: string;
  year: string;
  portal?: boolean;
  onViewAnswers: (guide: FormKey) => void;
}) {
  const [step, setStep] = useState<(typeof STEPS)[number]>("Expediente");
  const [status, setStatus] = useState("Pendiente");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [psychologists, setPsychologists] = useState<CompanyPsychologist[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionForm[]>([]);
  const [closure, setClosure] = useState<ClosureForm>(emptyClosure);
  const [closureSaved, setClosureSaved] = useState(false);
  const reasons = getReferralReasons(employee, data);
  const guidesLabel = reasons.map((reason) => reason.title).join(" · ");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = portal
        ? await getPortalEmployeeReferral(studentId, year)
        : await getCompanyEmployeeReferral(authStorage.getToken()!, companyId, studentId, year);
      setPsychologists(result.psychologists);
      if (result.referral) {
        setStatus(result.referral.status);
        setSessions(
          result.referral.sessions.map((session, index) => ({
            localId: session.id ?? `loaded-${index}`,
            psychologistId: session.psychologistId,
            datetime: toLocalInput(session.datetime),
            status: session.status,
            notes: session.notes ?? "",
            saved: true,
          })),
        );
        setClosure({
          psychologistId: result.referral.closure.psychologistId ?? "",
          conclusion: result.referral.closure.conclusion ?? "",
          recommendations: result.referral.closure.recommendations ?? "",
          resolution: (result.referral.closure.resolution as ClosureForm["resolution"]) ?? "",
        });
        setClosureSaved(Boolean(result.referral.closure.resolution));
      } else {
        setStatus("Pendiente");
        setSessions([]);
        setClosure(emptyClosure);
        setClosureSaved(false);
      }
    } catch (error) {
      showError(apiMessage(error, "No se pudo cargar la canalización"));
    } finally {
      setLoading(false);
    }
  }, [companyId, portal, studentId, year]);

  useEffect(() => {
    void load();
  }, [load]);

  function findPsychologist(id: string) {
    return psychologists.find((item) => item.id === id) ?? null;
  }

  function updateDraft(key: keyof typeof emptyDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSession(localId: string, patch: Partial<SessionForm>) {
    setSessions((current) =>
      current.map((session) =>
        session.localId === localId ? { ...session, ...patch, saved: false } : session,
      ),
    );
  }

  function updateClosureField<K extends keyof ClosureForm>(key: K, value: ClosureForm[K]) {
    setClosureSaved(false);
    setClosure((current) => ({ ...current, [key]: value }));
  }

  function startEdit(psychologist: CompanyPsychologist) {
    if (psychologist.inUse) {
      showWarning(
        "Este psicólogo ya está en uso en sesiones o cierres de la empresa.",
        "No editable",
      );
      return;
    }
    setEditingId(psychologist.id);
    setDraft({
      name: psychologist.name,
      license: psychologist.license,
      phone: psychologist.phone ?? "",
      email: psychologist.email ?? "",
      address: psychologist.address ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function savePsychologist() {
    const input = {
      name: draft.name.trim(),
      license: draft.license.trim(),
      phone: draft.phone.trim() || null,
      email: draft.email.trim() || null,
      address: draft.address.trim() || null,
    };
    if (!input.name) {
      showWarning("Indica el nombre del psicólogo.", "Falta el nombre");
      return;
    }
    if (!input.license) {
      showWarning("Indica la cédula profesional.", "Falta la cédula");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const result = portal
          ? await updatePortalPsychologist(editingId, input)
          : await updateCompanyPsychologist(authStorage.getToken()!, companyId, editingId, input);
        setPsychologists((current) =>
          current.map((item) => (item.id === result.psychologist.id ? result.psychologist : item)),
        );
        showSuccess("Psicólogo actualizado");
      } else {
        const result = portal
          ? await createPortalPsychologist(input)
          : await createCompanyPsychologist(authStorage.getToken()!, companyId, input);
        setPsychologists((current) => {
          if (current.some((item) => item.id === result.psychologist.id)) return current;
          return [...current, result.psychologist].sort((a, b) =>
            a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
          );
        });
        showSuccess("Psicólogo agregado a la empresa");
        if (status === "Pendiente") setStatus("Canalizado");
      }
      setEditingId(null);
      setDraft(emptyDraft);
      await load();
    } catch (error) {
      showError(apiMessage(error, "No se pudo guardar el psicólogo"));
    } finally {
      setSaving(false);
    }
  }

  async function removePsychologist(psychologist: CompanyPsychologist) {
    if (psychologist.inUse) {
      showWarning(
        "Este psicólogo ya está en uso en sesiones o cierres de la empresa.",
        "No se puede quitar",
      );
      return;
    }
    setSaving(true);
    try {
      if (portal) await deletePortalPsychologist(psychologist.id);
      else await deleteCompanyPsychologist(authStorage.getToken()!, companyId, psychologist.id);
      if (editingId === psychologist.id) cancelEdit();
      showSuccess("Psicólogo eliminado");
      await load();
    } catch (error) {
      showError(apiMessage(error, "No se pudo eliminar el psicólogo"));
    } finally {
      setSaving(false);
    }
  }

  function addSession() {
    if (!psychologists.length) {
      showWarning("Agrega al menos un psicólogo de la empresa.", "Sin psicólogos");
      setStep("Psicólogo");
      return;
    }
    setSessions((current) => [
      ...current,
      {
        localId: `new-${Date.now()}`,
        psychologistId: psychologists.length === 1 ? psychologists[0].id : "",
        datetime: "",
        status: "Programada",
        notes: "",
        saved: false,
      },
    ]);
    if (status === "Pendiente" || status === "Canalizado") setStatus("En atención");
  }

  function removeSession(localId: string) {
    const session = sessions.find((item) => item.localId === localId);
    if (!session) return;
    if (!isSessionEmpty(session)) {
      showWarning("Solo puedes quitar una sesión si aún no tiene datos.", "Sesión con datos");
      return;
    }
    setSessions((current) => current.filter((item) => item.localId !== localId));
  }

  async function persistReferral(nextStatus: string, nextSessions: SessionForm[], nextClosure: ClosureForm | null) {
    const payload = {
      status: nextStatus,
      sessions: nextSessions
        .filter((session) => session.saved || session.datetime.trim())
        .map((session) => ({
          psychologistId: session.psychologistId,
          datetime: session.datetime,
          status: session.status,
          notes: session.notes.trim() || null,
        })),
      closure: nextClosure?.resolution
        ? {
            psychologistId: nextClosure.psychologistId || null,
            conclusion: nextClosure.conclusion.trim() || null,
            recommendations: nextClosure.recommendations.trim() || null,
            resolution: nextClosure.resolution,
          }
        : null,
    };
    if (portal) await savePortalEmployeeReferral(studentId, year, payload);
    else await saveCompanyEmployeeReferral(authStorage.getToken()!, companyId, studentId, year, payload);
  }

  async function saveSession(localId: string) {
    const session = sessions.find((item) => item.localId === localId);
    if (!session) return;
    if (!session.psychologistId) {
      showWarning("Selecciona el psicólogo que lleva la sesión.", "Falta el psicólogo");
      return;
    }
    if (!session.datetime.trim()) {
      showWarning("Indica la fecha y hora de la sesión.", "Falta la fecha");
      return;
    }
    const nextSessions = sessions.map((item) =>
      item.localId === localId ? { ...item, saved: true } : item,
    );
    const nextStatus = "En atención";
    setSaving(true);
    try {
      await persistReferral(nextStatus, nextSessions, null);
      setSessions(nextSessions);
      setStatus(nextStatus);
      showSuccess("Sesión guardada");
      await load();
    } catch (error) {
      showError(apiMessage(error, "No se pudo guardar la sesión"));
    } finally {
      setSaving(false);
    }
  }

  async function saveClosure() {
    if (!psychologists.length) {
      showWarning("Agrega al menos un psicólogo de la empresa.", "Sin psicólogos");
      setStep("Psicólogo");
      return;
    }
    if (!closure.psychologistId) {
      showWarning("Selecciona el psicólogo responsable del cierre.", "Falta el psicólogo");
      return;
    }
    if (!closure.conclusion.trim()) {
      showWarning("Escribe la conclusión y resultado.", "Falta la conclusión");
      return;
    }
    if (!closure.resolution) {
      showWarning("Selecciona la resolución del caso.", "Falta la resolución");
      return;
    }
    setSaving(true);
    try {
      await persistReferral(closure.resolution, sessions.filter((session) => session.saved), closure);
      setClosureSaved(true);
      setStatus(closure.resolution);
      showSuccess(`Cierre guardado · ${closure.resolution}`);
      await load();
    } catch (error) {
      showError(apiMessage(error, "No se pudo guardar el cierre"));
    } finally {
      setSaving(false);
    }
  }

  const savedSessions = sessions.filter((session) => session.saved).length;
  const stepDone: Record<(typeof STEPS)[number], boolean> = {
    Expediente: reasons.length > 0,
    Psicólogo: psychologists.length > 0,
    Sesiones: savedSessions > 0,
    Cierre: closureSaved,
  };

  if (loading) {
    return <p className="text-sm text-brand-muted">Cargando canalización...</p>;
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-brand-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
              Canalización NOM-035 · {year}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold">{name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted">
              Registro del seguimiento psicológico. Empieza por el motivo (resultados de las guías),
              asigna psicólogo, documenta sesiones y cierra el caso.
            </p>
            {reasons.length ? (
              <p className="mt-3 text-sm text-brand-gray">
                <span className="font-semibold">Motivos detectados:</span>{" "}
                <span className="text-brand-muted">{guidesLabel}</span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-brand-muted">
                Este año no hay resultados que indiquen canalización automática.
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-brand-light text-brand-gray"}`}
            >
              {status}
            </span>
            <p className="mt-2 max-w-[14rem] text-xs text-brand-muted">
              {STATUS_HELP[status] ?? "Estado del caso"}
            </p>
          </div>
        </div>
      </header>

      <nav aria-label="Pasos de canalización" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => {
          const meta = STEP_META[item];
          const active = step === item;
          const done = stepDone[item];
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => setStep(item)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-line bg-white text-brand-gray hover:border-brand-blue/40"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{meta.label}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    active ? "text-white/80" : done ? "text-emerald-700" : "text-brand-muted"
                  }`}
                >
                  {done ? "Listo" : "Pendiente"}
                </span>
              </span>
              <span className={`mt-1 block text-xs ${active ? "text-white/80" : "text-brand-muted"}`}>
                {meta.hint}
              </span>
            </button>
          );
        })}
      </nav>

      <div hidden={step !== "Expediente"}>
        <Section
          title="¿Por qué se canaliza a esta persona?"
          description="Estos motivos salen de los resultados NOM-035 del año seleccionado. Úsalos como base del expediente clínico."
        >
          {reasons.length ? (
            <div className="space-y-4">
              {reasons.map((reason, index) => (
                <article key={reason.key} className="rounded-xl border border-brand-line p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                        Motivo {index + 1} de {reasons.length}
                      </p>
                      <h4 className="mt-1 font-semibold text-brand-gray">
                        {reason.title}
                        {GUIDE_BLURB[reason.key] ? (
                          <span className="font-normal text-brand-muted">
                            {" "}
                            · {GUIDE_BLURB[reason.key]}
                          </span>
                        ) : null}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewAnswers(reason.key)}
                      className="shrink-0 text-sm font-semibold text-brand-blue hover:underline"
                    >
                      Ver respuestas →
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {reason.descriptions.map((description) => (
                      <li
                        key={description}
                        className="rounded-lg bg-brand-light/70 px-3 py-2.5 text-sm text-brand-gray"
                      >
                        {description}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
                <p className="text-sm text-brand-muted">
                  Siguiente: registra o elige al psicólogo que dará el seguimiento.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("Psicólogo")}
                  className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light"
                >
                  Continuar a psicólogo →
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-6">
              <p className="text-sm font-semibold text-brand-gray">Sin motivo automático este año</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                No hay Guía I con valoración clínica, ni Guía II/III en riesgo alto o muy alto (ni
                violencia laboral alta). Aun así puedes registrar psicólogo, sesiones y cierre si el
                seguimiento se abre por otro criterio.
              </p>
              <button
                type="button"
                onClick={() => setStep("Psicólogo")}
                className="mt-4 text-sm font-semibold text-brand-blue hover:underline"
              >
                Ir a psicólogos →
              </button>
            </div>
          )}
        </Section>
      </div>

      <div hidden={step !== "Psicólogo"}>
        <Section
          title="Psicólogos de la empresa"
          description="Listado compartido para todos los empleados. Si un psicólogo ya se usó en sesiones o cierres, no se puede editar ni eliminar."
        >
          {psychologists.length ? (
            <ul className="mb-6 space-y-3">
              {psychologists.map((psychologist) => (
                <li
                  key={psychologist.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-brand-line bg-brand-light/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-gray">{psychologist.name}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Cédula {psychologist.license}
                      {psychologist.phone ? ` · ${psychologist.phone}` : ""}
                      {psychologist.email ? ` · ${psychologist.email}` : ""}
                      {psychologist.inUse ? " · En uso" : ""}
                    </p>
                    {psychologist.address ? (
                      <p className="mt-1 text-sm text-brand-muted">{psychologist.address}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {!psychologist.inUse && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(psychologist)}
                          className="text-sm font-semibold text-brand-blue hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void removePsychologist(psychologist)}
                          className="text-sm font-semibold text-brand-muted hover:text-brand-gray hover:underline"
                        >
                          Quitar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-6 rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-4 text-sm text-brand-muted">
              Aún no hay psicólogos. Agrega al menos uno para poder registrar sesiones y el cierre.
            </p>
          )}

          <h4 className="mb-4 text-sm font-semibold text-brand-gray">
            {editingId ? "Editar psicólogo" : "Agregar psicólogo"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del psicólogo">
              <input
                className={input}
                autoComplete="off"
                placeholder="Nombre completo"
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </Field>
            <Field label="Cédula profesional">
              <input
                className={input}
                placeholder="Número de cédula"
                value={draft.license}
                onChange={(event) => updateDraft("license", event.target.value)}
              />
            </Field>
            <Field label="Teléfono de contacto">
              <input
                type="tel"
                className={input}
                value={draft.phone}
                onChange={(event) => updateDraft("phone", event.target.value)}
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                type="email"
                className={input}
                value={draft.email}
                onChange={(event) => updateDraft("email", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Dirección de consulta">
                <textarea
                  className={input}
                  rows={2}
                  value={draft.address}
                  onChange={(event) => updateDraft("address", event.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void savePsychologist()}
              className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-50"
            >
              {editingId ? "Guardar cambios" : "Agregar psicólogo"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-brand-line px-4 py-2.5 text-sm font-semibold text-brand-gray hover:bg-brand-light"
              >
                Cancelar
              </button>
            )}
          </div>
          {psychologists.length > 0 && !editingId ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
              <p className="text-sm text-brand-muted">Cuando ya tengas psicólogo, documenta las citas.</p>
              <button
                type="button"
                onClick={() => setStep("Sesiones")}
                className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light"
              >
                Continuar a sesiones →
              </button>
            </div>
          ) : null}
        </Section>
      </div>

      <div hidden={step !== "Sesiones"}>
        <Section
          title="Citas y sesiones"
          description="Registra cada cita con psicólogo, fecha y observaciones. Solo las sesiones guardadas quedan en el expediente."
        >
          {!sessions.length && (
            <p className="mb-5 rounded-xl border border-dashed border-brand-line bg-brand-light/40 px-4 py-4 text-sm text-brand-muted">
              Aún no hay sesiones. Usa “Agregar sesión” para la primera cita.
            </p>
          )}
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <article key={session.localId} className="rounded-xl border border-brand-line p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-semibold">
                    Sesión {index + 1}
                    {session.saved ? (
                      <span className="ml-2 text-xs font-semibold text-emerald-700">· Guardada</span>
                    ) : null}
                  </h4>
                  {isSessionEmpty(session) && (
                    <button
                      type="button"
                      onClick={() => removeSession(session.localId)}
                      className="text-sm font-semibold text-brand-muted hover:text-brand-gray hover:underline"
                    >
                      Quitar sesión
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Psicólogo que lleva la sesión">
                      <select
                        className={input}
                        value={session.psychologistId}
                        onChange={(event) =>
                          updateSession(session.localId, { psychologistId: event.target.value })
                        }
                      >
                        <option value="">Seleccionar psicólogo</option>
                        {psychologists.map((item) => (
                          <option key={item.id} value={item.id}>
                            {psychologistLabel(item)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Fecha y hora">
                    <input
                      type="datetime-local"
                      className={input}
                      value={session.datetime}
                      onChange={(event) =>
                        updateSession(session.localId, { datetime: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Estado de la cita">
                    <select
                      className={input}
                      value={session.status}
                      onChange={(event) =>
                        updateSession(session.localId, {
                          status: event.target.value as SessionForm["status"],
                        })
                      }
                    >
                      {SESSION_STATUSES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Observaciones del psicólogo">
                      <textarea
                        className={input}
                        rows={3}
                        value={session.notes}
                        onChange={(event) =>
                          updateSession(session.localId, { notes: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveSession(session.localId)}
                  className="mt-4 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-50"
                >
                  {session.saved ? "Actualizar sesión" : "Guardar sesión"}
                </button>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={addSession}
              className="rounded-lg border border-brand-blue px-4 py-2.5 text-sm font-semibold text-brand-blue"
            >
              Agregar sesión
            </button>
            {savedSessions > 0 ? (
              <button
                type="button"
                onClick={() => setStep("Cierre")}
                className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light"
              >
                Continuar a cierre →
              </button>
            ) : null}
          </div>
        </Section>
      </div>

      <div hidden={step !== "Cierre"}>
        <Section
          title="Cierre del caso"
          description="Conclusión del psicólogo, recomendaciones y resolución final (alta o seguimiento)."
        >
          {closureSaved && (
            <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Cierre guardado · <strong>{closure.resolution}</strong>
              {findPsychologist(closure.psychologistId)
                ? ` · ${findPsychologist(closure.psychologistId)!.name}`
                : ""}
            </p>
          )}
          <div className="space-y-4">
            <Field label="Psicólogo responsable del cierre">
              <select
                className={input}
                value={closure.psychologistId}
                onChange={(event) => updateClosureField("psychologistId", event.target.value)}
              >
                <option value="">Seleccionar psicólogo</option>
                {psychologists.map((item) => (
                  <option key={item.id} value={item.id}>
                    {psychologistLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Conclusión y resultado">
              <textarea
                className={input}
                rows={4}
                value={closure.conclusion}
                onChange={(event) => updateClosureField("conclusion", event.target.value)}
              />
            </Field>
            <Field label="Recomendaciones finales">
              <textarea
                className={input}
                rows={4}
                value={closure.recommendations}
                onChange={(event) => updateClosureField("recommendations", event.target.value)}
              />
            </Field>
            <Field label="Resolución del caso">
              <select
                className={input}
                value={closure.resolution}
                onChange={(event) =>
                  updateClosureField("resolution", event.target.value as ClosureForm["resolution"])
                }
              >
                <option value="" disabled>
                  Seleccionar resolución
                </option>
                <option value="Alta">Alta — concluye el seguimiento</option>
                <option value="Seguimiento">Seguimiento — el caso continúa</option>
              </select>
            </Field>
          </div>
          <div className="mt-5">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveClosure()}
              className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-50"
            >
              {closureSaved ? "Actualizar cierre" : "Guardar cierre"}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
