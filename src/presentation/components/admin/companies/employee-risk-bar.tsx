"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DashboardEmployeeLink } from "./dashboard-employee-link";

export type RiskBarPerson = { studentId: string; name: string };
export type RiskBarSegment = { key: string; label: string; color: string; count: number; people: RiskBarPerson[] };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

export function EmployeeRiskBar({ label, segments, readOnly, returnTo, hoverOnly = false, cell, population }: {
  label: string; segments: RiskBarSegment[]; readOnly: boolean; returnTo: string;
  hoverOnly?: boolean;
  cell?: { color: string };
  population?: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ key: string; x: number; y: number; above: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  const total = population ?? segments.reduce((sum, segment) => sum + segment.count, 0);
  const active = segments.find(segment => segment.key === selected);
  const hovered = segments.find(segment => segment.key === preview?.key);
  const percentage = (count: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(total ? count / total * 100 : 0);

  useEffect(() => {
    if (!selected) return;
    const panel = dialog.current;
    panel?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      panel?.close();
      document.body.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [selected]);

  useEffect(() => {
    const dismiss = () => setPreview(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => { window.removeEventListener("scroll", dismiss, true); window.removeEventListener("resize", dismiss); };
  }, []);

  function showPreview(key: string, element: HTMLButtonElement) {
    if (selected) return;
    const rect = element.getBoundingClientRect();
    const above = rect.bottom > window.innerHeight - 230;
    setPreview({ key, x: Math.max(12, Math.min(rect.left, window.innerWidth - 300)), y: above ? rect.top - 8 : rect.bottom + 8, above });
  }
  function open(key: string, element: HTMLButtonElement) {
    if (hoverOnly) { showPreview(key, element); return; }
    trigger.current = element;
    setPreview(null);
    setSearch("");
    setSelected(key);
  }
  const controls = (segment: RiskBarSegment) => ({
    "aria-haspopup": hoverOnly ? undefined : "dialog" as const,
    "aria-expanded": selected === segment.key,
    "aria-describedby": preview?.key === segment.key ? `${id}-tooltip` : undefined,
    onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => { if (event.pointerType === "mouse") showPreview(segment.key, event.currentTarget); },
    onPointerLeave: () => setPreview(null),
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => showPreview(segment.key, event.currentTarget),
    onBlur: () => setPreview(null),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => open(segment.key, event.currentTarget),
  });
  const people = active?.people.filter(person => normalize(person.name).includes(normalize(search.trim()))) ?? [];
  return <div onKeyDown={event => { if (event.key === "Escape") setPreview(null); }}>
    {cell ? segments.map(segment => <button key={segment.key} type="button" {...controls(segment)}
      aria-label={`${label} · ${segment.label}: ${segment.count} personas. Ver empleados`}
      className="w-full cursor-pointer rounded-lg px-3 py-2 focus-visible:outline focus-visible:outline-brand-blue"
      style={{ background: segment.color, color: cell.color }}>
      <span className="block text-lg font-bold">{segment.count}</span><span className="text-xs">{percentage(segment.count)}%</span>
    </button>) : <div className="flex h-6 overflow-hidden rounded-lg bg-brand-light" role="group" aria-label={label}>
      {segments.filter(segment => segment.count > 0).map(segment => <button key={segment.key} type="button" {...controls(segment)} aria-label={`${label} · ${segment.label}: ${segment.count} personas (${percentage(segment.count)}%). Ver empleados`} className="h-full cursor-pointer border-r border-white/70 last:border-r-0 hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-gray" style={{ width: `${total ? segment.count / total * 100 : 0}%`, background: segment.color }} />)}
    </div>}
    {!cell && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">{segments.filter(segment => segment.count > 0).map(segment => <button key={segment.key} type="button" {...controls(segment)} className="inline-flex cursor-pointer items-center gap-1.5 rounded text-left text-xs text-brand-muted hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue"><span className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10" style={{ background: segment.color }}/>{segment.label}: <strong>{segment.count} · {percentage(segment.count)}%</strong></button>)}</div>}
    {preview && hovered && !active && createPortal(<div id={`${id}-tooltip`} role="tooltip" className="pointer-events-none fixed z-[100] w-72 max-w-[calc(100vw-24px)] rounded-xl border border-brand-line bg-white p-4 shadow-xl" style={{ left: preview.x, top: preview.y, transform: preview.above ? "translateY(-100%)" : undefined }}>
      <p className="text-xs text-brand-muted">{label}</p><p className="mt-1 text-sm font-semibold text-brand-gray"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: hovered.color }}/>{hovered.label} · {hovered.count}</p>
      <ul className="mt-2 space-y-1 text-xs text-brand-gray">{hovered.people.slice(0, 3).map(person => <li key={person.studentId} className="truncate">{person.name}</li>)}</ul>
      {hovered.count > 3 && <p className="mt-2 text-xs text-brand-muted">Y {hovered.count - 3} más</p>}
    </div>, document.body)}
    {active && createPortal(<dialog ref={dialog} aria-labelledby={`${id}-title`} onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-slate-950/40">
      <section className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="border-b border-brand-line p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-brand-muted">{label}</p><h2 id={`${id}-title`} className="mt-2 font-display text-xl font-bold text-brand-gray">Empleados · {active.label}</h2><p className="mt-2 text-sm text-brand-muted"><span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: active.color }}/>{active.count} {active.count === 1 ? "persona" : "personas"} · {percentage(active.count)}%</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Cerrar panel de empleados" className="rounded-lg px-3 py-2 text-brand-muted hover:bg-brand-light">✕</button></div><label className="mt-5 block"><span className="sr-only">Buscar empleado</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar empleado…" className="w-full rounded-xl border border-brand-line px-4 py-3 text-sm outline-none focus:border-brand-blue"/></label></header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6"><ul className="divide-y divide-brand-line">{people.map(person => <li key={person.studentId} className="py-4"><DashboardEmployeeLink studentId={person.studentId} name={person.name} readOnly={readOnly} returnTo={returnTo}/></li>)}</ul>{!people.length && <p role="status" className="py-8 text-center text-sm text-brand-muted">{search ? "No hay empleados que coincidan con la búsqueda." : "No hay nombres disponibles."}</p>}</div>
      </section>
    </dialog>, document.body)}
  </div>;
}
