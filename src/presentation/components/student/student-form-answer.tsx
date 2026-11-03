"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isSectionVisible,
  type FormAnswers,
  type FormDefinition,
  type FormQuestion,
  type FormSection,
} from "@/core/domain/forms/types";
import { getStudentForm, saveStudentForm } from "@/infrastructure/http/student-forms-api";
import { confirmAction, showError, showSuccess } from "@/shared/lib/alerts";
import {
  FormQuestionInput,
  optionsFor,
} from "@/presentation/components/admin/forms/form-question-input";

type SaveState = "idle" | "saving" | "saved" | "error";
const AUTOSAVE_MS = 1500;
const ADVANCE_MS = 300;

interface Step {
  section: FormSection;
  question: FormQuestion;
}

/** Preguntas visibles en orden, según las respuestas actuales (secciones condicionales). */
function visibleSteps(form: FormDefinition, answers: FormAnswers): Step[] {
  return form.sections
    .filter((s) => isSectionVisible(s, answers, form))
    .flatMap((section) => section.questions.map((question) => ({ section, question })));
}

/** El empleado contesta una guía (modo "self"). Autoguarda; al enviar ya no se puede reabrir. */
export function StudentFormAnswer({ formKey }: { formKey: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [needAnswer, setNeedAnswer] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sending, setSending] = useState(false);
  const [exiting, setExiting] = useState(false);
  const dirty = useRef(false);
  const latest = useRef<FormAnswers>({});

  useEffect(() => {
    getStudentForm(formKey)
      .then((r) => {
        setForm(r.form);
        setAnswers(r.answers);
        latest.current = r.answers;
        // Reanudar en la primera pregunta visible sin contestar.
        const steps = visibleSteps(r.form, r.answers);
        const firstOpen = steps.find((st) => !r.answers[st.question.id]) ?? steps[steps.length - 1];
        setCurrentId(firstOpen?.question.id ?? null);
      })
      .catch((err) =>
        setUnavailable(err instanceof Error ? err.message : "Este formulario no está disponible"),
      );
  }, [formKey]);

  const inflight = useRef<Promise<boolean> | null>(null);
  const persist = useCallback(async (): Promise<boolean> => {
    // Si hay un guardado en curso, se espera antes de decidir.
    if (inflight.current) {
      const ok = await inflight.current;
      if (!ok) return false;
    }
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const run = (async () => {
      try {
        await saveStudentForm(formKey, latest.current);
        setSaveState("saved");
        return true;
      } catch (err) {
        dirty.current = true;
        setSaveState("error");
        showError(err instanceof Error ? err.message : "No se pudo guardar tu avance");
        return false;
      }
    })();
    inflight.current = run;
    try {
      return await run;
    } finally {
      inflight.current = null;
    }
  }, [formKey]);

  // Autoguardado con pausa tras el último cambio.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => void persist(), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [answers, persist]);

  // Al salir (otra ruta, cerrar pestaña, recargar) se guarda lo pendiente sin esperar al autoguardado.
  useEffect(() => {
    const flush = () => {
      if (!dirty.current) return;
      dirty.current = false;
      void saveStudentForm(formKey, latest.current, false, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [formKey]);

  const steps = useMemo(() => (form ? visibleSteps(form, answers) : []), [form, answers]);
  // Si un cambio ocultó la pregunta actual, se va a la siguiente visible.
  const index = Math.max(
    0,
    steps.findIndex((st) => st.question.id === currentId),
  );

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  if (unavailable) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-brand-line bg-white p-8 text-center">
        <p className="font-medium text-brand-gray">Este formulario no está disponible</p>
        <p className="mt-2 text-sm text-brand-muted">
          Puede que ya lo hayas enviado o que tu empresa ya no lo solicite.
        </p>
        <Link href="/mis-cursos" className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline">
          Volver a Mis cursos
        </Link>
      </div>
    );
  }
  if (!form || steps.length === 0) return <p className="text-sm text-brand-muted">Cargando formulario...</p>;

  const step = steps[index];
  const q = step.question;
  const isLast = index === steps.length - 1;
  const answered = steps.filter((st) => !!answers[st.question.id]).length;
  const current = answers[q.id];

  function cancelAdvance() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }

  function goTo(i: number) {
    cancelAdvance();
    setNeedAnswer(false);
    const target = steps[Math.min(Math.max(i, 0), steps.length - 1)];
    setCurrentId(target.question.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setAnswer(id: string, value: string, autoAdvance: boolean) {
    dirty.current = true;
    const next = { ...latest.current, [id]: value };
    latest.current = next;
    setAnswers(next);
    setNeedAnswer(false);
    if (!autoAdvance || !form) return;
    cancelAdvance();
    advanceTimer.current = setTimeout(() => {
      // Con las respuestas nuevas (pueden abrir/cerrar secciones).
      const list = visibleSteps(form, latest.current);
      const i = list.findIndex((st) => st.question.id === id);
      if (i >= 0 && i < list.length - 1) {
        setCurrentId(list[i + 1].question.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, ADVANCE_MS);
  }

  function next() {
    if (!answers[q.id]) {
      setNeedAnswer(true);
      return;
    }
    goTo(index + 1);
  }

  /** Guarda lo pendiente; si se guardó, confirma y vuelve a Mis cursos. */
  async function handleExit() {
    cancelAdvance();
    setExiting(true);
    try {
      const ok = await persist();
      if (!ok) return; // persist ya mostró el error; no se sale.
      const leave = await confirmAction({
        title: "¿Salir del formulario?",
        text: "Tu avance quedó guardado. Podrás continuar después desde Mis cursos.",
        confirmText: "Salir",
        cancelText: "Seguir contestando",
        icon: "question",
      });
      if (leave) router.push("/mis-cursos");
    } finally {
      setExiting(false);
    }
  }

  async function handleSend() {
    if (!form) return;
    const firstMissing = steps.findIndex((st) => !answers[st.question.id]);
    if (firstMissing >= 0) {
      const miss = steps.length - answered;
      goTo(firstMissing);
      setNeedAnswer(true);
      showError(`Te faltan ${miss} ${miss === 1 ? "pregunta" : "preguntas"} por contestar`);
      return;
    }
    const ok = await confirmAction({
      title: "¿Enviar tus respuestas?",
      text: "Una vez enviado ya no podrás modificarlo.",
      confirmText: "Sí, enviar",
      icon: "question",
    });
    if (!ok) return;
    setSending(true);
    try {
      dirty.current = false;
      await saveStudentForm(formKey, latest.current, true);
      await showSuccess("¡Gracias! Tus respuestas se enviaron.");
      router.replace("/mis-cursos");
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo enviar");
      setSending(false);
    }
  }

  const options = q.kind === "text" ? [] : optionsFor(form, q);
  // Solo cuentan las secciones que aplican con las respuestas actuales (las condicionales
  // omitidas no se numeran), así el contador no brinca. Guía I usa números romanos.
  const applicableSectionIds = steps.reduce<string[]>((ids, st) => {
    if (ids[ids.length - 1] !== st.section.id) ids.push(st.section.id);
    return ids;
  }, []);
  const sectionNumber = applicableSectionIds.indexOf(step.section.id) + 1;
  const sectionTotal = applicableSectionIds.length;
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const sectionLabel = (n: number) => (formKey === "nom035_guia1" && ROMAN[n] ? ROMAN[n] : String(n));
  const pct = Math.round(((index + 1) / steps.length) * 100);

  return (
    <div
      className="mx-auto max-w-2xl space-y-5 pb-10 outline-none"
      tabIndex={-1}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        if (e.key === "ArrowRight") next();
        else if (e.key === "ArrowLeft") goTo(index - 1);
        else if (/^[1-9]$/.test(e.key) && options[Number(e.key) - 1]) {
          setAnswer(q.id, options[Number(e.key) - 1].value, !isLast);
        }
      }}
    >
      <div>
        <button
          type="button"
          onClick={() => void handleExit()}
          disabled={sending || exiting}
          className="text-sm font-medium text-brand-muted hover:text-brand-gray"
        >
          ← Mis cursos
        </button>
        <h1 className="mt-2 font-display text-xl font-bold text-brand-gray sm:text-2xl">{form.title}</h1>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-brand-muted">
          <span>
            Sección {sectionLabel(sectionNumber)} de {sectionLabel(sectionTotal)}
          </span>
          <span>
            {saveState === "saving"
              ? "Guardando..."
              : saveState === "saved"
                ? "Avance guardado"
                : saveState === "error"
                  ? "No se pudo guardar"
                  : "Se guarda automáticamente"}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-brand-light"
          role="progressbar"
          aria-label="Avance"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-brand-black transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section key={q.id} className="overflow-hidden rounded-2xl border border-brand-line bg-white">
        {(step.section.title || step.section.instructions) && (
          <header className="border-b border-brand-line bg-brand-light/60 px-5 py-4">
            {step.section.title && (
              <h2 className="text-sm font-semibold text-brand-gray">{step.section.title}</h2>
            )}
            {step.section.instructions && (
              <p className={`text-sm text-brand-muted ${step.section.title ? "mt-0.5" : ""}`}>
                {step.section.instructions}
              </p>
            )}
          </header>
        )}
        <div className="px-5 py-6">
          <p className="text-base font-medium text-brand-gray sm:text-lg">
            {q.number != null && <span className="mr-2 tabular-nums text-brand-muted">{q.number}.</span>}
            {q.text}
          </p>
          {q.note && <p className="mt-2 text-xs text-brand-muted">{q.note}</p>}

          {q.kind === "text" ? (
            <FormQuestionInput
              form={form}
              question={q}
              value={current}
              onChange={(v) => setAnswer(q.id, v, false)}
              namePrefix="me-"
            />
          ) : (
            <div
              role="radiogroup"
              aria-label={q.text}
              className={`mt-5 grid gap-3 ${options.length <= 2 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {options.map((opt) => {
                const checked = current === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setAnswer(q.id, opt.value, !isLast)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors ${
                      checked
                        ? "border-brand-blue bg-blue-50 font-semibold text-brand-gray"
                        : "border-brand-line text-brand-gray hover:bg-brand-light"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        checked ? "border-brand-blue" : "border-brand-line"
                      }`}
                    >
                      {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                    </span>
                    <span className="flex-1">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          {needAnswer && !current && (
            <p className="mt-3 text-sm font-medium text-red-700">Elige una respuesta para continuar</p>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0 || sending}
          className="min-h-12 rounded-xl border border-brand-line px-5 text-sm font-medium text-brand-gray hover:bg-brand-light disabled:opacity-40"
        >
          Anterior
        </button>
        <span aria-hidden />
        {isLast ? (
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending}
            className="min-h-12 rounded-xl bg-brand-black px-6 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            disabled={sending}
            className="min-h-12 rounded-xl bg-brand-black px-6 text-sm font-semibold text-white hover:bg-brand-gray disabled:opacity-50"
          >
            Siguiente
          </button>
        )}
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => void handleExit()}
          disabled={sending || exiting}
          className="min-h-11 rounded-xl px-5 text-sm font-medium text-brand-muted hover:bg-brand-light hover:text-brand-gray disabled:opacity-50"
        >
          {exiting ? "Guardando..." : "Salir"}
        </button>
      </div>
    </div>
  );
}
