"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companyAuthStorage } from "@/infrastructure/auth/company-auth-storage";
import { CompanyAuthError, companyLogin } from "@/infrastructure/http/company-auth-api";
import { showError } from "@/shared/lib/alerts";
import { PasswordField } from "@/presentation/components/ui/password-field";

export function CompanyLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya hay sesión de empresa, directo al portal.
  useEffect(() => {
    if (companyAuthStorage.getToken()) router.replace("/empresa");
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const { token } = await companyLogin(email.trim(), password.trim());
      companyAuthStorage.setToken(token);
      router.replace("/empresa");
    } catch (err) {
      showError(
        err instanceof CompanyAuthError ? err.message : "Intenta de nuevo.",
        "No se pudo iniciar sesión",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="company-email" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Correo electrónico
          </label>
          <input
            id="company-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm text-brand-gray outline-none transition-colors focus:border-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="company-password" className="mb-1.5 block text-sm font-medium text-brand-gray">
            Contraseña
          </label>
          <PasswordField
            id="company-password"
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
          {isSubmitting ? "Ingresando..." : "Ingresar como empresa"}
        </button>
      </form>

      <div className="rounded-xl border border-brand-line bg-brand-light/60 px-4 py-4 text-center">
        <p className="text-sm text-brand-muted">¿Eres alumno?</p>
        <Link
          href="/mis-cursos/login"
          className="mt-2 inline-block text-sm font-semibold text-brand-blue hover:underline"
        >
          Ingresar a mis cursos
        </Link>
      </div>
    </div>
  );
}
