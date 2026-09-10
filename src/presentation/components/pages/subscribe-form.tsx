"use client";

import { showSuccess } from "@/shared/lib/alerts";
import Link from "next/link";

export function SubscribeForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showSuccess(
      "Pronto recibirás novedades sobre eventos y capacitaciones.",
      "¡Gracias por suscribirte!",
    );
    e.currentTarget.reset();
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
        className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray"
      >
        Suscribirme
      </button>
      <p className="text-xs leading-relaxed text-brand-muted">
        Al suscribirte aceptas nuestro{" "}
        <Link href="/aviso-de-privacidad" className="font-medium text-brand-blue hover:underline">
          aviso de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
