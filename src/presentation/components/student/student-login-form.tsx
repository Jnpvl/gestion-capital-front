"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClientError, useStudentAuth } from "@/presentation/providers/student-auth-provider";
import { PasswordField } from "@/presentation/components/ui/password-field";

export function StudentLoginForm() {
  const router = useRouter();
  const { login } = useStudentAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password.trim());
      router.replace("/mis-cursos");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="student-email" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Correo electrónico
          </label>
          <input
            id="student-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="student-password" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Contraseña
          </label>
          <PasswordField
            id="student-password"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar a mis cursos"}
        </button>
      </form>

      <div className="rounded-xl border border-brand-line bg-brand-light/60 px-4 py-4 text-center">
        <p className="text-sm text-brand-muted">¿Aún no tienes acceso?</p>
        <Link
          href="/contacto?servicio=capacitacion"
          className="mt-2 inline-block text-sm font-semibold text-brand-blue hover:underline"
        >
          Solicitar información
        </Link>
      </div>
    </div>
  );
}
