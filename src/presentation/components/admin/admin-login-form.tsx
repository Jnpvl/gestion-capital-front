"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showError } from "@/shared/lib/alerts";
import { ApiClientError, useAuth } from "@/presentation/providers/auth-provider";

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiClientError) {
        showError(err.message, "No se pudo iniciar sesión");
      } else {
        showError("Intenta de nuevo.", "No se pudo iniciar sesión");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-gray">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Ingresar al panel"}
      </button>
    </form>
  );
}
