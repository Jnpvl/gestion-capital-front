"use client";

import { useState } from "react";
import Link from "next/link";
import { SubscribeApiError, subscribeToNewsletter } from "@/infrastructure/http/subscribe-api";
import { showError, showSuccess } from "@/shared/lib/alerts";

export function SubscribeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);

    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter({
        name: String(data.get("nombre") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        company: String(data.get("empresa") ?? "").trim() || undefined,
      });

      if (result.alreadySubscribed) {
        showSuccess(
          "Este correo ya estaba registrado para recibir novedades.",
          "Ya estás suscrito",
        );
      } else {
        showSuccess(
          "Pronto recibirás novedades sobre eventos y capacitaciones.",
          "¡Gracias por suscribirte!",
        );
      }
      formEl.reset();
    } catch (error) {
      showError(
        error instanceof SubscribeApiError
          ? error.message
          : "No se pudo completar la suscripción. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray disabled:opacity-50"
      >
        {isSubmitting ? "Suscribiendo..." : "Suscribirme"}
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
