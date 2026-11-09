"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DashboardEmployeeLink } from "./dashboard-employee-link";
import type { RiskBarPerson } from "./employee-risk-bar";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

interface EmployeePeopleCardProps {
  label: string;
  value: string | number;
  note: string;
  people: RiskBarPerson[];
  readOnly: boolean;
  returnTo: string;
  accent?: boolean;
}

export function EmployeePeopleCard({
  label,
  value,
  note,
  people,
  readOnly,
  returnTo,
  accent = false,
}: EmployeePeopleCardProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const interactive = people.length > 0;
  const filtered = people.filter((person) =>
    normalize(person.name).includes(normalize(search.trim())),
  );

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
    if (open || !interactive) return;
    const rect = element.getBoundingClientRect();
    const above = rect.bottom > window.innerHeight - 230;
    setPreview({
      x: Math.max(12, Math.min(rect.left, window.innerWidth - 300)),
      y: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  }

  const className = `rounded-2xl border p-5 text-left transition-colors ${
    accent
      ? "border-brand-blue bg-brand-blue text-white"
      : "border-brand-line bg-white text-brand-gray"
  } ${interactive ? (accent ? "hover:bg-brand-blue-light" : "hover:border-brand-blue/40 hover:bg-brand-light/40") : ""}`;

  const content = (
    <>
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className={`mt-2 text-xs ${accent ? "text-white/75" : "text-brand-muted"}`}>{note}</p>
    </>
  );

  return (
    <div onKeyDown={(event) => { if (event.key === "Escape") setPreview(null); }}>
      {interactive ? (
        <button
          ref={trigger}
          type="button"
          className={`${className} w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={preview ? `${id}-tooltip` : undefined}
          aria-label={`${label}: ${value}. Ver empleados`}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") showPreview(event.currentTarget);
          }}
          onPointerLeave={() => setPreview(null)}
          onFocus={(event) => showPreview(event.currentTarget)}
          onBlur={() => setPreview(null)}
          onClick={() => {
            setPreview(null);
            setSearch("");
            setOpen(true);
          }}
        >
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}

      {preview && interactive && !open &&
        createPortal(
          <div
            id={`${id}-tooltip`}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-72 max-w-[calc(100vw-24px)] rounded-xl border border-brand-line bg-white p-4 shadow-xl"
            style={{
              left: preview.x,
              top: preview.y,
              transform: preview.above ? "translateY(-100%)" : undefined,
            }}
          >
            <p className="text-xs text-brand-muted">{label}</p>
            <p className="mt-1 text-sm font-semibold text-brand-gray">
              {people.length} {people.length === 1 ? "persona" : "personas"}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-brand-gray">
              {people.slice(0, 3).map((person) => (
                <li key={person.studentId} className="truncate">
                  {person.name}
                </li>
              ))}
            </ul>
            {people.length > 3 && (
              <p className="mt-2 text-xs text-brand-muted">Y {people.length - 3} más</p>
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
                    <p className="text-xs text-brand-muted">Guía I</p>
                    <h2
                      id={`${id}-title`}
                      className="mt-2 font-display text-xl font-bold text-brand-gray"
                    >
                      Empleados · {label}
                    </h2>
                    <p className="mt-2 text-sm text-brand-muted">
                      {people.length} {people.length === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar panel de empleados"
                    className="rounded-lg px-3 py-2 text-brand-muted hover:bg-brand-light"
                  >
                    ✕
                  </button>
                </div>
                <label className="mt-5 block">
                  <span className="sr-only">Buscar empleado</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar empleado…"
                    className="w-full rounded-xl border border-brand-line px-4 py-3 text-sm outline-none focus:border-brand-blue"
                  />
                </label>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                <ul className="divide-y divide-brand-line">
                  {filtered.map((person) => (
                    <li key={person.studentId} className="py-4">
                      <DashboardEmployeeLink
                        studentId={person.studentId}
                        name={person.name}
                        readOnly={readOnly}
                        returnTo={returnTo}
                      />
                    </li>
                  ))}
                </ul>
                {!filtered.length && (
                  <p role="status" className="py-8 text-center text-sm text-brand-muted">
                    {search
                      ? "No hay empleados que coincidan con la búsqueda."
                      : "No hay nombres disponibles."}
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
