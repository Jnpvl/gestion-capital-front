"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { contactoContent } from "@/shared/content";

export function ContactForm() {
  const { form } = contactoContent;
  const searchParams = useSearchParams();
  const defaultServicio = searchParams.get("servicio") ?? "";
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-brand-line bg-brand-light p-8 text-center">
        <p className="text-brand-gray">{form.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Nombre completo *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>
        <div>
          <label htmlFor="empresa" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Empresa
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Correo electrónico *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>
      </div>
      <div>
        <label htmlFor="servicio" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Servicio de interés
        </label>
        <select
          id="servicio"
          name="servicio"
          defaultValue={defaultServicio}
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        >
          <option value="">Selecciona una opción</option>
          <option value="capital-humano">Capital humano</option>
          <option value="capacitacion">Capacitación y formación</option>
          <option value="seguridad">Seguridad e higiene</option>
          <option value="cumplimiento">Cumplimiento normativo</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          required
          className="w-full resize-y rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray sm:w-auto"
      >
        {form.submitLabel}
      </button>
    </form>
  );
}
