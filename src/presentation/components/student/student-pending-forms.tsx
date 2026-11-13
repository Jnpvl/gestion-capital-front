"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPendingForms, type StudentPendingForm } from "@/infrastructure/http/student-forms-api";

/** Tarjeta "Formularios pendientes": solo guías que contesta el empleado y que no ha enviado. */
export function StudentPendingForms() {
  const [forms, setForms] = useState<StudentPendingForm[]>([]);

  useEffect(() => {
    let cancelled = false;
    listPendingForms()
      .then((r) => { if (!cancelled) setForms(r.forms); })
      .catch(() => { if (!cancelled) setForms([]); });
    return () => { cancelled = true; };
  }, []);

  if (forms.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-brand-gray">Formularios pendientes</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Tu empresa te pidió contestar {forms.length === 1 ? "este cuestionario" : "estos cuestionarios"}.
        Solo se contestan una vez; puedes guardar tu avance y continuar después.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {forms.map((f) => (
          <li
            key={f.formKey}
            className="flex flex-col justify-between gap-3 rounded-xl border border-brand-line bg-white p-4"
          >
            <div>
              <p className="font-semibold text-brand-gray">{f.title}</p>
              <p className="mt-0.5 text-sm text-brand-muted">{f.subtitle}</p>
              <p className="mt-2 text-xs text-brand-muted">
                {f.status === "in_progress" ? "En progreso" : "Sin empezar"}
                {f.dueAt ? ` · Fecha límite: ${new Date(f.dueAt).toLocaleDateString("es-MX")}` : ""}
              </p>
            </div>
            <Link
              href={`/mis-cursos/formularios/${f.formKey}`}
              className="self-start rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gray"
            >
              {f.status === "in_progress" ? "Continuar" : "Contestar"}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
