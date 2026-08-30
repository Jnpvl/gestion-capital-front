"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-8 text-center">
        <p className="font-medium text-brand-gray">¡Gracias por suscribirte!</p>
        <p className="mt-2 text-sm text-brand-muted">
          Pronto recibirás novedades sobre eventos y capacitaciones.
          (Formulario de demostración — se conectará al panel administrativo.)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sub-nombre" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Nombre *
        </label>
        <input
          id="sub-nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>
      <div>
        <label htmlFor="sub-email" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Correo electrónico *
        </label>
        <input
          id="sub-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>
      <div>
        <label htmlFor="sub-empresa" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Empresa (opcional)
        </label>
        <input
          id="sub-empresa"
          name="empresa"
          type="text"
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-light"
      >
        Suscribirme
      </button>
    </form>
  );
}
