"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ContactApiError, sendContactMessage } from "@/infrastructure/http/contact-api";
import { contactoContent } from "@/shared/content";
import { showError, showSuccess } from "@/shared/lib/alerts";

export function ContactForm() {
  const { form } = contactoContent;
  const searchParams = useSearchParams();
  const defaultServicio = searchParams.get("servicio") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        nombre: String(data.get("nombre") ?? "").trim(),
        empresa: String(data.get("empresa") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        telefono: String(data.get("telefono") ?? "").trim(),
        servicio: String(data.get("servicio") ?? "").trim(),
        mensaje: String(data.get("mensaje") ?? "").trim(),
      });
      showSuccess(form.successMessage, "Mensaje enviado");
      formEl.reset();
    } catch (error) {
      showError(
        error instanceof ContactApiError
          ? error.message
          : "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
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
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? "Enviando..." : form.submitLabel}
      </button>
      <p className="text-xs leading-relaxed text-brand-muted">
        Al enviar este formulario aceptas nuestro{" "}
        <Link href="/aviso-de-privacidad" className="font-medium text-brand-blue hover:underline">
          aviso de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
