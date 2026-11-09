"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RISK_LEVEL_LABEL, type RiskLevel } from "@/core/domain/forms/types";

export type ScoringScopeItem = {
  number: number;
  text: string;
  dimension: string;
  domainName?: string;
};

export type ScoringScope = {
  kind: "category" | "domain";
  name: string;
  cutoffs: number[];
  items: ScoringScopeItem[];
};

const LEVELS: RiskLevel[] = ["nulo", "bajo", "medio", "alto", "muy_alto"];
const format = new Intl.NumberFormat("es-MX");

function cutoffLegend(cutoffs: number[]) {
  const [c0, c1, c2, c3] = cutoffs;
  return [
    { level: LEVELS[0], range: `< ${format.format(c0)}` },
    { level: LEVELS[1], range: `≥ ${format.format(c0)} y < ${format.format(c1)}` },
    { level: LEVELS[2], range: `≥ ${format.format(c1)} y < ${format.format(c2)}` },
    { level: LEVELS[3], range: `≥ ${format.format(c2)} y < ${format.format(c3)}` },
    { level: LEVELS[4], range: `≥ ${format.format(c3)}` },
  ];
}

/** Botón para revisar qué preguntas alimentan una categoría o dominio. */
export function ScoringScopeTrigger({ scope }: { scope: ScoringScope }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const kindLabel = scope.kind === "category" ? "Categoría" : "Dominio";

  useEffect(() => {
    if (!open) return;
    const panel = dialog.current;
    panel?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      panel?.close();
      document.body.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const dismiss = () => setPreview(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, []);

  function showPreview(element: HTMLButtonElement) {
    if (open) return;
    const rect = element.getBoundingClientRect();
    const above = rect.bottom > window.innerHeight - 260;
    setPreview({
      x: Math.max(12, Math.min(rect.left, window.innerWidth - 340)),
      y: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  }

  const groups = new Map<string, ScoringScopeItem[]>();
  for (const item of scope.items) {
    const key = scope.kind === "category"
      ? `${item.domainName ?? "Dominio"} · ${item.dimension}`
      : item.dimension;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return (
    <div
      className="inline-flex"
      onKeyDown={(event) => {
        if (event.key === "Escape") setPreview(null);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-left font-medium text-brand-gray transition-colors hover:bg-black/5 hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={preview ? `${id}-tooltip` : undefined}
        aria-label={`${scope.name}: ver preguntas contempladas`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") showPreview(event.currentTarget);
        }}
        onPointerLeave={() => setPreview(null)}
        onFocus={(event) => showPreview(event.currentTarget)}
        onBlur={() => setPreview(null)}
        onClick={() => {
          setPreview(null);
          setOpen(true);
        }}
      >
        {scope.name}
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
          · {scope.items.length} ítems
        </span>
      </button>

      {preview && !open &&
        createPortal(
          <div
            id={`${id}-tooltip`}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-80 max-w-[calc(100vw-24px)] rounded-xl border border-brand-line bg-white p-4 shadow-xl"
            style={{
              left: preview.x,
              top: preview.y,
              transform: preview.above ? "translateY(-100%)" : undefined,
            }}
          >
            <p className="text-xs text-brand-muted">{kindLabel}</p>
            <p className="mt-1 text-sm font-semibold text-brand-gray">{scope.name}</p>
            <p className="mt-1 text-xs text-brand-muted">
              {scope.items.length} preguntas contempladas en el cálculo
            </p>
            <ul className="mt-2 space-y-1 text-xs text-brand-gray">
              {scope.items.slice(0, 4).map((item) => (
                <li key={item.number} className="truncate">
                  <span className="font-semibold text-brand-blue">{item.number}.</span> {item.text}
                </li>
              ))}
            </ul>
            {scope.items.length > 4 && (
              <p className="mt-2 text-xs text-brand-muted">
                Y {scope.items.length - 4} más · clic para ver todas
              </p>
            )}
          </div>,
          document.body,
        )}

      {open &&
        createPortal(
          <dialog
            ref={dialog}
            aria-labelledby={`${id}-title`}
            onCancel={() => setOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
            className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-slate-950/40"
          >
            <section className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
              <header className="border-b border-brand-line p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-brand-muted">{kindLabel} · preguntas del cálculo</p>
                    <h2
                      id={`${id}-title`}
                      className="mt-2 font-display text-xl font-bold text-brand-gray"
                    >
                      {scope.name}
                    </h2>
                    <p className="mt-2 text-sm text-brand-muted">
                      {scope.items.length}{" "}
                      {scope.items.length === 1 ? "pregunta" : "preguntas"} · cutoffs propios
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar detalle de preguntas"
                    className="rounded-lg px-3 py-2 text-brand-muted hover:bg-brand-light"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4 rounded-xl bg-brand-light p-3">
                  <p className="text-xs font-semibold text-brand-gray">Rangos de nivel</p>
                  <ul className="mt-2 space-y-1 text-xs text-brand-muted">
                    {cutoffLegend(scope.cutoffs).map((row) => (
                      <li key={row.level} className="flex justify-between gap-3">
                        <span>{RISK_LEVEL_LABEL[row.level]}</span>
                        <span className="tabular-nums font-medium text-brand-gray">{row.range}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                {[...groups.entries()].map(([groupName, items]) => (
                  <div key={groupName} className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      {groupName}
                    </p>
                    <ul className="mt-2 divide-y divide-brand-line">
                      {items.map((item) => (
                        <li key={item.number} className="py-3 text-sm text-brand-gray">
                          <span className="font-semibold text-brand-blue">{item.number}.</span>{" "}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!scope.items.length && (
                  <p className="py-8 text-center text-sm text-brand-muted">
                    No hay ítems definidos para este alcance.
                  </p>
                )}
              </div>
            </section>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
