import type { Metadata } from "next";
import Link from "next/link";
import { CompanyLoginForm } from "@/presentation/components/company/company-login-form";
import { Logo } from "@/presentation/components/ui/logo";

export const metadata: Metadata = {
  title: "Acceso para empresas",
  robots: { index: false, follow: false },
};

export default function CompanyLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-light">
      <div className="px-4 pt-6">
        <Link href="/" className="text-sm font-medium text-brand-muted hover:text-brand-gray">
          ← Volver al sitio
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-brand-line bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <Logo />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold text-brand-gray">Portal de empresas</h1>
            <p className="mt-2 text-sm text-brand-muted">
              Ingresa con las credenciales que te proporcionó el equipo de Gestiona.
            </p>
          </div>
          <CompanyLoginForm />
        </div>
      </div>
    </div>
  );
}
